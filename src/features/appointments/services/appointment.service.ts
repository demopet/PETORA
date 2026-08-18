import { supabase } from "@/lib/supabase/client";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@/schemas/appointment";
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/types/appointment";

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
    msg.includes("INVALID_STATE_TRANSITION") ||
    msg.includes("APPOINTMENT_NOT_IN_PROGRESS") ||
    msg.includes("NOT_FOUND")
  ) {
    const clean = msg
      .replace("VALIDATION_ERROR: ", "")
      .replace("INVALID_STATE_TRANSITION: ", "")
      .replace("NOT_FOUND: ", "");
    return new AppError(clean, error.code);
  }
  if (error.code === "23505" || msg.includes("MEDICAL_RECORD_ALREADY_EXISTS")) {
    return new AppError(
      "A medical record already exists for this appointment.",
      "MEDICAL_RECORD_ALREADY_EXISTS",
    );
  }

  return new AppError(msg, error.code);
}

export async function createAppointment(
  input: CreateAppointmentInput,
  callerUserId: string,
): Promise<Appointment> {
  const validated = createAppointmentSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_appointment", {
    p_caller_id: callerUserId,
    p_customer_id: validated.customer_id,
    p_pet_id: validated.pet_id,
    p_doctor_id: validated.doctor_id ?? null,
    p_appointment_date: validated.appointment_date,
    p_appointment_time: validated.appointment_time,
    p_complaint: validated.complaint ?? null,
    p_notes: validated.notes ?? null,
    p_is_from_portal: validated.is_from_portal ?? false,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return appointment as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  input: UpdateAppointmentStatusInput,
  callerUserId: string,
): Promise<{ appointment: Appointment; promptCreateMedicalRecord: boolean }> {
  const validated = updateAppointmentStatusSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_update_appointment_status", {
    p_caller_id: callerUserId,
    p_appointment_id: id,
    p_new_status: validated.status,
  });

  if (error) {
    throw mapPgError(error);
  }

  const result = data as { id: string; prompt_create_medical_record: boolean };

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return {
    appointment: appointment as Appointment,
    promptCreateMedicalRecord: result.prompt_create_medical_record ?? false,
  };
}

export async function cancelAppointment(
  id: string,
  callerUserId: string,
  reason?: string,
): Promise<Appointment> {
  const { data, error } = await supabase.rpc("fn_cancel_appointment", {
    p_caller_id: callerUserId,
    p_appointment_id: id,
    p_reason: reason ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return appointment as Appointment;
}
