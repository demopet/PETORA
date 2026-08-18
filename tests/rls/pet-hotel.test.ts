import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("pet-hotel RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let kasirUserId: string;
  let customerId: string;
  let petId: string;
  let roomId: string;
  let bookingId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-ph-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Pet Hotel Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-ph-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Pet Hotel Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const kasirResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-ph-kasir",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "RLS Pet Hotel Kasir",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error)
      console.error("Create owner error:", ownerResult.error);
    if (adminResult.error)
      console.error("Create admin error:", adminResult.error);
    if (kasirResult.error)
      console.error("Create kasir error:", kasirResult.error);

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-ph-owner",
      p_pin: "123456",
    });
    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-ph-admin",
      p_pin: "123456",
    });
    const kasirLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-ph-kasir",
      p_pin: "123456",
    });

    if (ownerLogin.data) ownerUserId = ownerLogin.data.user.id;
    if (adminLogin.data) adminUserId = adminLogin.data.user.id;
    if (kasirLogin.data) kasirUserId = kasirLogin.data.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Pet Hotel Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "RLS PH Pet",
      p_species: "Dog",
    });

    if (petData) petId = petData.id as string;

    const { data: roomData } = await supabase
      .from("rooms")
      .insert({
        name: "RLS Room",
        room_number: "RLS-01",
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

  it("authenticated users can select rooms", async () => {
    const { data, error } = await supabase.from("rooms").select("id");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can create pet hotel booking", async () => {
    const { data, error } = await supabase.rpc("fn_create_pet_hotel_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_room_id: roomId,
      p_check_in_date: "2025-12-10",
      p_check_out_date: "2025-12-12",
      p_price_per_night: 150000,
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    if (data) bookingId = (data as any).id;
  });

  it("kasir can check in booking", async () => {
    const { error } = await supabase.rpc("fn_check_in_booking", {
      p_caller_id: kasirUserId,
      p_booking_id: bookingId,
    });

    expect(error).toBeNull();
  });

  it("admin can check out booking", async () => {
    const { error } = await supabase.rpc("fn_check_out_booking", {
      p_caller_id: adminUserId,
      p_booking_id: bookingId,
      p_actual_check_out_date: "2025-12-12",
    });

    expect(error).toBeNull();
  });

  it("invalid state transition returns error", async () => {
    const { data: newBooking } = await supabase.rpc("fn_create_pet_hotel_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_room_id: roomId,
      p_check_in_date: "2025-12-15",
      p_check_out_date: "2025-12-17",
      p_price_per_night: 150000,
    });

    const newBookingId = (newBooking as any).id;

    const { error } = await supabase.rpc("fn_check_out_booking", {
      p_caller_id: ownerUserId,
      p_booking_id: newBookingId,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("BOOKING_NOT_ACTIVE");

    await supabase
      .rpc("fn_cancel_pet_hotel_booking", {
        p_caller_id: ownerUserId,
        p_booking_id: newBookingId,
      })
      .catch(() => {});
  });

  it("room is unavailable for overlapping dates", async () => {
    const { data: existingBooking } = await supabase.rpc("fn_create_pet_hotel_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_room_id: roomId,
      p_check_in_date: "2025-12-10",
      p_check_out_date: "2025-12-15",
      p_price_per_night: 150000,
    });

    expect((existingBooking as any)?.id).toBeDefined();

    const { error } = await supabase.rpc("fn_create_pet_hotel_booking", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_customer_id: customerId,
      p_room_id: roomId,
      p_check_in_date: "2025-12-12",
      p_check_out_date: "2025-12-14",
      p_price_per_night: 150000,
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("ROOM_NOT_AVAILABLE");

    await supabase
      .rpc("fn_cancel_pet_hotel_booking", {
        p_caller_id: ownerUserId,
        p_booking_id: (existingBooking as any).id,
      })
      .catch(() => {});
  });
});
