import { supabase } from "@/lib/supabase/client";
import {
  createGroomingBookingSchema,
  startGroomingSchema,
  finishGroomingSchema,
  cancelGroomingSchema,
} from "@/schemas/grooming";
import type {
  GroomingBooking,
  CreateGroomingBookingInput,
  GroomingRecord,
  CreateGroomingRecordInput,
} from "@/types/grooming";

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
    msg.includes("INVALID_STATE_TRANSITION") ||
    msg.includes("NOT_FOUND")
  ) {
    const clean = msg
      .replace("VALIDATION_ERROR: ", "")
      .replace("BOOKING_NOT_ACTIVE: ", "")
      .replace("INVALID_STATE_TRANSITION: ", "")
      .replace("NOT_FOUND: ", "");
    return new AppError(clean, error.code);
  }

  return new AppError(msg, error.code);
}

export async function createGroomingBooking(
  input: CreateGroomingBookingInput,
  callerUserId: string,
): Promise<GroomingBooking> {
  const validated = createGroomingBookingSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_grooming_booking", {
    p_caller_id: callerUserId,
    p_pet_id: validated.pet_id,
    p_customer_id: validated.customer_id,
    p_groomer_id: validated.groomer_id ?? null,
    p_service_id: validated.service_id,
    p_appointment_date: validated.appointment_date,
    p_appointment_time: validated.appointment_time,
    p_notes: validated.notes ?? null,
    p_is_from_portal: validated.is_from_portal ?? false,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("grooming_bookings")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as GroomingBooking;
}

export async function startGrooming(
  bookingId: string,
  callerUserId: string,
): Promise<GroomingBooking> {
  const validated = startGroomingSchema.parse({ booking_id: bookingId });

  const { error } = await supabase.rpc("fn_start_grooming", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("grooming_bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as GroomingBooking;
}

export async function finishGrooming(
  bookingId: string,
  input: CreateGroomingRecordInput,
  callerUserId: string,
): Promise<{ booking: GroomingBooking; record: GroomingRecord }> {
  const validated = finishGroomingSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_finish_grooming", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
    p_skin_condition: validated.skin_condition ?? null,
    p_flea_tick_found: validated.flea_tick_found ?? false,
    p_recommendations: validated.recommendations ?? null,
    p_before_photo_url: validated.before_photo_url ?? null,
    p_after_photo_url: validated.after_photo_url ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const result = data as { id: string; record_id: string };

  const { data: booking, error: bookingError } = await supabase
    .from("grooming_bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError) {
    throw mapPgError(bookingError);
  }

  const { data: record, error: recordError } = await supabase
    .from("grooming_records")
    .select("*")
    .eq("id", result.record_id)
    .single();

  if (recordError) {
    throw mapPgError(recordError);
  }

  return {
    booking: booking as GroomingBooking,
    record: record as GroomingRecord,
  };
}

export async function cancelGrooming(
  bookingId: string,
  callerUserId: string,
  reason?: string,
): Promise<GroomingBooking> {
  const validated = cancelGroomingSchema.parse({
    booking_id: bookingId,
    reason,
  });

  const { error } = await supabase.rpc("fn_cancel_grooming", {
    p_caller_id: callerUserId,
    p_booking_id: validated.booking_id,
    p_reason: validated.reason ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: booking, error: fetchError } = await supabase
    .from("grooming_bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return booking as GroomingBooking;
}
