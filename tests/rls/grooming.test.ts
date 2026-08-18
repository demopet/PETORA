import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("grooming RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let groomerUserId: string;
  let customerId: string;
  let petId: string;
  let serviceId: string;
  let bookingId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-groom-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Grooming Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const groomerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-groom-groomer",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "RLS Grooming Groomer",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error)
      console.error("Create owner error:", ownerResult.error);
    if (groomerResult.error)
      console.error("Create groomer error:", groomerResult.error);

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-groom-owner",
      p_pin: "123456",
    });
    const groomerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-groom-groomer",
      p_pin: "123456",
    });

    if (ownerLogin.data) ownerUserId = ownerLogin.data.user.id;
    if (groomerLogin.data) groomerUserId = groomerLogin.data.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Grooming Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "RLS Groom Pet",
      p_species: "Dog",
    });

    if (petData) petId = petData.id as string;

    const { data: serviceData } = await supabase
      .from("grooming_services")
      .insert({
        name: "RLS Grooming Service",
        description: "Test service",
        base_price: 200000,
        duration_minutes: 60,
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

  it("authenticated users can select grooming services", async () => {
    const { data, error } = await supabase
      .from("grooming_services")
      .select("id");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can create grooming booking", async () => {
    const { data, error } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_groomer_id: groomerUserId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-01",
      p_appointment_time: "10:00",
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    if (data) bookingId = (data as any).id;
  });

  it("groomer can start own grooming booking", async () => {
    const { data: newBooking } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_groomer_id: groomerUserId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-10",
      p_appointment_time: "09:00",
    });

    const newBookingId = (newBooking as any).id;

    const { error } = await supabase.rpc("fn_start_grooming", {
      p_caller_id: groomerUserId,
      p_booking_id: newBookingId,
    });

    expect(error).toBeNull();

    const { data: booking } = await supabase
      .from("grooming_bookings")
      .select("status")
      .eq("id", newBookingId)
      .single();

    expect(booking!.status).toBe("IN_PROGRESS");

    await supabase
      .rpc("fn_finish_grooming", {
        p_caller_id: groomerUserId,
        p_booking_id: newBookingId,
      })
      .catch(() => {});
  });

  it("non-assigned groomer cannot start grooming", async () => {
    await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-groom-other",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "Other Groomer",
      p_created_by: ownerUserId,
    });

    const { data: otherData } = await supabase.rpc("fn_auth_login", {
      p_username: "rls-groom-other",
      p_pin: "123456",
    });

    const otherGroomerId = (otherData as any).user.id;

    const { data: newBooking } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_groomer_id: groomerUserId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-11",
      p_appointment_time: "11:00",
    });

    const { error } = await supabase.rpc("fn_start_grooming", {
      p_caller_id: otherGroomerId,
      p_booking_id: (newBooking as any).id,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");

    await supabase
      .rpc("fn_cancel_grooming", {
        p_caller_id: ownerUserId,
        p_booking_id: (newBooking as any).id,
        p_reason: "Cleanup",
      })
      .catch(() => {});
  });

  it("invalid state transition returns error", async () => {
    const { data: newBooking } = await supabase.rpc("fn_create_grooming_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_service_id: serviceId,
      p_appointment_date: "2025-12-12",
      p_appointment_time: "08:00",
    });

    const newBookingId = (newBooking as any).id;

    const { error } = await supabase.rpc("fn_finish_grooming", {
      p_caller_id: ownerUserId,
      p_booking_id: newBookingId,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("BOOKING_NOT_ACTIVE");

    await supabase
      .rpc("fn_cancel_grooming", {
        p_caller_id: ownerUserId,
        p_booking_id: newBookingId,
        p_reason: "Cleanup",
      })
      .catch(() => {});
  });
});
