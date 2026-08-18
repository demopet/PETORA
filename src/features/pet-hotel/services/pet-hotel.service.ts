import { supabase } from "@/lib/supabase/client";
import {
  createPetHotelBookingSchema,
  checkInBookingSchema,
  checkOutBookingSchema,
  addPetHotelLogSchema,
} from "@/schemas/pet-hotel";
import type {
  PetHotelBooking,
  CreatePetHotelBookingInput,
  PetHotelLog,
  CreatePetHotelLogInput,
} from "@/types/pet-hotel";

export class AppError extends Error {
  message_: string;
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.message_ = message;
    this.code = code;
  }
}

function mapPgError(error: { message: string; code?: string }): AppError {
  const msg = error.message || "Unknown error";

  if (error.code === "42501" || msg.includes("FORBIDDEN")) {
    return new AppError(
      "You do not have permission to perform this action.",
      "FORBIDDEN",
    );
  }
  if (
    error.code === "22000" ||
    msg.includes("VALIDATION_ERROR") ||
    msg.includes("BOOKING_NOT_ACTIVE") ||
    msg.includes("ROOM_NOT_AVAILABLE") ||
    msg.includes("INVALID_STATE_TRANSITION") ||
    msg.includes("NOT_FOUND")
  ) {
    const clean = msg
      .replace("VALIDATION_ERROR: ", "")
      .replace("BOOKING_NOT_ACTIVE: ", "")
      .replace("ROOM_NOT_AVAILABLE: ", "")
      .replace("INVALID_STATE_TRANSITION: ", "")
      .replace("NOT_FOUND: ", "");
    return new AppError(clean, error.code);
  }

  return new AppError(msg, error.code);
}

export async function createPetHotelBooking(
  input: CreatePetHotelBookingInput,
  callerUserId: string,
): Promise<PetHotelBooking> {
  const validated = createPetHotelBookingSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_pet_hotel_booking", {
    p_caller_id: callerUserId,
    p_pet_id: validated.pet_id,
    p_customer_id: validated.customer_id,
    p_room_id: validated.room_id ?? null,
    p_check_in_date: validated.check_in_date,
    p_check_out_date: validated.check_out_date,
    p_price_per_night: validated.price_per_night ?? null,
    p_special_notes: validated.special_notes ?? null,
    p_is_from_portal: validated.is_from_portal ?? false,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("pet_hotel_bookings")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as PetHotelBooking;
}

export async function checkInBooking(
  bookingId: string,
  callerUserId: string,
  actualRoomId?: string,
): Promise<PetHotelBooking> {
  const validated = checkInBookingSchema.parse({
    booking_id: bookingId,
    actual_room_id: actualRoomId,
  });

  const { error } = await supabase.rpc("fn_check_in_booking", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
    p_actual_room_id: validated.actual_room_id ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("pet_hotel_bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as PetHotelBooking;
}

export async function checkOutBooking(
  bookingId: string,
  callerUserId: string,
  actualCheckOutDate?: string,
): Promise<PetHotelBooking> {
  const validated = checkOutBookingSchema.parse({
    booking_id: bookingId,
    actual_check_out_date: actualCheckOutDate,
  });

  const { error } = await supabase.rpc("fn_check_out_booking", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
    p_actual_check_out_date: validated.actual_check_out_date ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("pet_hotel_bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as PetHotelBooking;
}

export async function addPetHotelLog(
  input: CreatePetHotelLogInput,
  callerUserId: string,
): Promise<PetHotelLog> {
  const validated = addPetHotelLogSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_add_pet_hotel_log", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
    p_log_type: validated.log_type,
    p_description: validated.description ?? null,
    p_photo_urls: validated.photo_urls ?? [],
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: log, error: fetchError } = await supabase
    .from("pet_hotel_logs")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return log as PetHotelLog;
}

export async function cancelPetHotelBooking(
  id: string,
  callerUserId: string,
): Promise<PetHotelBooking> {
  const { error } = await supabase.rpc("fn_cancel_pet_hotel_booking", {
    p_caller_id: callerUserId,
    p_booking_id: id,
    p_reason: null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("pet_hotel_bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as PetHotelBooking;
}
