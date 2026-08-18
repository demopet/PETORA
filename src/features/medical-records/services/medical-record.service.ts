import { supabase } from "@/lib/supabase/client";
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from "@/schemas/medical-record";
import type {
  MedicalRecord,
  CreateMedicalRecordInput,
  UpdateMedicalRecordInput,
} from "@/types/medical-record";

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
    msg.includes("APPOINTMENT_NOT_IN_PROGRESS") ||
    msg.includes("NOT_FOUND")
  ) {
    const clean = msg
      .replace("VALIDATION_ERROR: ", "")
      .replace("APPOINTMENT_NOT_IN_PROGRESS: ", "")
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

export async function createMedicalRecord(
  input: CreateMedicalRecordInput,
  callerUserId: string,
): Promise<MedicalRecord> {
  const validated = createMedicalRecordSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_medical_record", {
    p_caller_id: callerUserId,
    p_appointment_id: validated.appointment_id,
    p_chief_complaint: validated.chief_complaint ?? null,
    p_history: validated.history ?? null,
    p_physical_exam: validated.physical_exam ?? null,
    p_weight_kg: validated.weight_kg ?? null,
    p_temperature_c: validated.temperature_c ?? null,
    p_heart_rate_bpm: validated.heart_rate_bpm ?? null,
    p_respiratory_rate_bpm: validated.respiratory_rate_bpm ?? null,
    p_diagnosis: validated.diagnosis ?? null,
    p_treatment: validated.treatment ?? null,
    p_prescription: validated.prescription ?? null,
    p_lab_results: validated.lab_results ?? null,
    p_additional_notes: validated.additional_notes ?? null,
    p_attachments: validated.attachments ?? [],
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: record, error: fetchError } = await supabase
    .from("medical_records")
    .select("*")
    .eq("id", (data as { id: string }).id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return record as MedicalRecord;
}

export async function updateMedicalRecord(
  id: string,
  input: UpdateMedicalRecordInput,
  callerUserId: string,
): Promise<MedicalRecord> {
  const validated = updateMedicalRecordSchema.parse(input);

  const { error } = await supabase.rpc("fn_update_medical_record", {
    p_caller_id: callerUserId,
    p_medical_record_id: id,
    p_chief_complaint: validated.chief_complaint ?? null,
    p_history: validated.history ?? null,
    p_physical_exam: validated.physical_exam ?? null,
    p_weight_kg: validated.weight_kg ?? null,
    p_temperature_c: validated.temperature_c ?? null,
    p_heart_rate_bpm: validated.heart_rate_bpm ?? null,
    p_respiratory_rate_bpm: validated.respiratory_rate_bpm ?? null,
    p_diagnosis: validated.diagnosis ?? null,
    p_treatment: validated.treatment ?? null,
    p_prescription: validated.prescription ?? null,
    p_lab_results: validated.lab_results ?? null,
    p_additional_notes: validated.additional_notes ?? null,
    p_attachments: validated.attachments ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: record, error: fetchError } = await supabase
    .from("medical_records")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return record as MedicalRecord;
}

export async function deleteMedicalRecord(
  id: string,
  callerUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc("fn_delete_medical_record", {
    p_caller_id: callerUserId,
    p_medical_record_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }
}
