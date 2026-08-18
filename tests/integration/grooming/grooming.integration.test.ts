import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("grooming integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let groomerUserId: string;
  let customerId: string;
  let petId: string;
  let serviceId: string;
  let bookingId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "groom-integ-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Grooming Integration Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const groomerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "groom-integ-groomer",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "Grooming Integration Groomer",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) console.error("Create owner error:", ownerResult.error);
    if (groomerResult.error) console.error("Create groomer error:", groomerResult.error);

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "groom-integ-owner",
      p_pin: "123456",
    });

    const { data: groomerData } = await supabase.rpc("fn_auth_login", {
      p_username: "groom-integ-groomer",
      p_pin: "123456",
    });

    if (ownerData) ownerUserId = ownerData.user.id;
    if (groomerData) groomerUserId = groomerData.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Grooming Integration Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "Grooming Integ Pet",
      p_species: "Dog",
      p_breed: "Poodle",
    });

    if (petData) petId = petData.id as string;

    const { data: serviceData } = await supabase
      .from("grooming_services")
      .insert({
        name: "Full Grooming",
        description: "Complete grooming service",
        base_price: 250000,
        duration_minutes: 90,
        is_active: true,
      })
      .select("*")
      .single();

    if (serviceData) serviceId = serviceData.id as string;
  });

  afterAll(async () => {
    if (bookingId) {
      await supabase
        .from("grooming_bookings")
        .delete()
        .eq("id", bookingId)
        .catch(() => {});
    }
    if (serviceId) {
      await supabase
        .from("grooming_services")
        .delete()
        .eq("id", serviceId)
        .catch(() => {});
    }
    if (petId) {
      await supabase
        .rpc("fn_delete_pet", {
          p_caller_id: ownerUserId,
          p_pet_id: petId,
        })
        .catch(() => {});
    }
    if (customerId) {
      await supabase
        .rpc("fn_delete_customer", {
          p_caller_id: ownerUserId,
          p_customer_id: customerId,
        })
        .catch(() => {});
    }
  });

  it("creates a grooming booking via fn_create_grooming_booking", async () => {
    const { data, error } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_groomer_id: groomerUserId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-01",
      p_appointment_time: "10:00",
    });

    if (error) console.error("Create booking error:", error);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect((data as any)?.id).toBeDefined();
    expect((data as any)?.booking_number).toBeDefined();
    bookingId = (data as any).id;
  });

  it("retrieves the created booking", async () => {
    const { data, error } = await supabase
      .from("grooming_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.status).toBe("BOOKED");
    expect(data!.booking_number).toContain("GR-");
    expect(data!.total_price).toBe(250000);
  });

  it("starts grooming", async () => {
    const { data, error } = await supabase.rpc("fn_start_grooming", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(bookingId);

    const { data: booking } = await supabase
      .from("grooming_bookings")
      .select("status")
      .eq("id", bookingId)
      .single();

    expect(booking!.status).toBe("IN_PROGRESS");
  });

  it("finishes grooming and creates grooming record and invoice", async () => {
    const { data, error } = await supabase.rpc("fn_finish_grooming", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
      p_skin_condition: "Healthy skin",
      p_flea_tick_found: false,
      p_recommendations: "Regular brushing recommended",
      p_before_photo_url: "https://example.com/before.jpg",
      p_after_photo_url: "https://example.com/after.jpg",
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(bookingId);

    const { data: booking } = await supabase
      .from("grooming_bookings")
      .select("status")
      .eq("id", bookingId)
      .single();

    expect(booking!.status).toBe("DONE");

    const { data: record } = await supabase
      .from("grooming_records")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    expect(record).toBeDefined();
    expect(record!.skin_condition).toBe("Healthy skin");
    expect(record!.after_photo_url).toBe("https://example.com/after.jpg");

    const { data: invoiceItems } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("grooming_booking_id", bookingId);

    expect(invoiceItems).toHaveLength(1);
    expect(invoiceItems![0].item_type).toBe("GROOMING");
  });

  it("cannot start grooming twice", async () => {
    const { error } = await supabase.rpc("fn_start_grooming", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("BOOKING_NOT_ACTIVE");
  });

  it("cancels a booking", async () => {
    const { data: cancelData } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-05",
      p_appointment_time: "14:00",
    });

    const { error } = await supabase.rpc("fn_cancel_grooming", {
      p_caller_id: ownerUserId,
      p_booking_id: (cancelData as any).id,
      p_reason: "Testing cancellation",
    });

    expect(error).toBeNull();

    const { data: booking } = await supabase
      .from("grooming_bookings")
      .select("status")
      .eq("id", (cancelData as any).id)
      .single();

    expect(booking!.status).toBe("CANCELLED");
  });
});
