import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("pet-hotel integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let customerId: string;
  let petId: string;
  let roomId: string;
  let bookingId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "ph-integ-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Pet Hotel Integration Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) console.error("Create owner error:", ownerResult.error);

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "ph-integ-owner",
      p_pin: "123456",
    });

    if (ownerData) ownerUserId = ownerData.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Pet Hotel Integration Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "Pet Hotel Integ Pet",
      p_species: "Dog",
      p_breed: "Golden Retriever",
    });

    if (petData) petId = petData.id as string;

    const { data: roomData } = await supabase
      .from("rooms")
      .insert({
        name: "Integration Room",
        room_number: "INT-01",
        room_type: "STANDARD",
        price_per_night: 150000,
        capacity: 1,
        status: "AVAILABLE",
        cleanliness: "CLEAN",
      })
      .select("*")
      .single();

    if (roomData) roomId = roomData.id as string;
  });

  afterAll(async () => {
    if (bookingId) {
      await supabase
        .from("pet_hotel_bookings")
        .delete()
        .eq("id", bookingId)
        .catch(() => {});
    }
    if (roomId) {
      await supabase
        .from("rooms")
        .delete()
        .eq("id", roomId)
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

  it("creates a pet hotel booking via fn_create_pet_hotel_booking", async () => {
    const { data, error } = await supabase.rpc("fn_create_pet_hotel_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_room_id: roomId,
      p_check_in_date: "2025-12-01",
      p_check_out_date: "2025-12-03",
      p_price_per_night: 150000,
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
      .from("pet_hotel_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.status).toBe("BOOKED");
    expect(data!.booking_number).toContain("BK-");
  });

  it("checks in the booking", async () => {
    const { data, error } = await supabase.rpc("fn_check_in_booking", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(bookingId);

    const { data: booking } = await supabase
      .from("pet_hotel_bookings")
      .select("status, actual_check_in_at")
      .eq("id", bookingId)
      .single();

    expect(booking!.status).toBe("CHECKED_IN");
    expect(booking!.actual_check_in_at).not.toBeNull();
  });

  it("adds a log to the checked-in booking", async () => {
    const { data, error } = await supabase.rpc("fn_add_pet_hotel_log", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
      p_log_type: "FEEDING",
      p_description: "Morning feeding",
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBeDefined();
  });

  it("checks out the booking and creates invoice", async () => {
    const { data, error } = await supabase.rpc("fn_check_out_booking", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
      p_actual_check_out_date: "2025-12-03",
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(bookingId);

    const { data: booking } = await supabase
      .from("pet_hotel_bookings")
      .select("status, total_price")
      .eq("id", bookingId)
      .single();

    expect(booking!.status).toBe("CHECKED_OUT");
    expect(booking!.total_price).toBeGreaterThan(0);

    const { data: invoiceItems } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("pet_hotel_booking_id", bookingId);

    expect(invoiceItems).toHaveLength(1);
    expect(invoiceItems![0].item_type).toBe("PET_HOTEL");
  });

  it("cannot check out an already checked-out booking", async () => {
    const { error } = await supabase.rpc("fn_check_out_booking", {
      p_caller_id: ownerUserId,
      p_booking_id: bookingId,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("BOOKING_NOT_ACTIVE");
  });
});
