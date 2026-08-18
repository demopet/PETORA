import { supabase } from "@/lib/supabase/client";
import { createCustomerSchema, updateCustomerSchema } from "@/schemas/customer";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  Customer,
} from "@/types/customer";

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
  if (error.code === "22000" || msg.includes("VALIDATION_ERROR")) {
    return new AppError(
      msg.replace("VALIDATION_ERROR: ", ""),
      "VALIDATION_ERROR",
    );
  }
  if (error.code === "23505" || msg.includes("CONFLICT")) {
    return new AppError(msg.replace("CONFLICT: ", ""), "CONFLICT");
  }
  if (msg.includes("NOT_FOUND")) {
    return new AppError(msg.replace("NOT_FOUND: ", ""), "NOT_FOUND");
  }

  return new AppError(msg, error.code);
}

export async function createCustomer(
  input: CreateCustomerInput,
  callerUserId: string,
): Promise<Customer> {
  const validated = createCustomerSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_customer", {
    p_caller_id: callerUserId,
    p_name: validated.name,
    p_phone: validated.phone ?? null,
    p_email: validated.email ?? null,
    p_address: validated.address ?? null,
    p_emergency_contact: validated.emergency_contact ?? null,
    p_photo_url: validated.photo_url ?? null,
    p_notes: validated.notes ?? null,
    p_is_guest: validated.is_guest ?? false,
    p_tags: validated.tags ?? [],
    p_create_account: validated.create_account ?? false,
    p_username: validated.username ?? null,
    p_pin: validated.pin ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", data!.id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return customer as Customer;
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
  callerUserId: string,
): Promise<Customer> {
  const validated = updateCustomerSchema.parse(input);

  const { error } = await supabase.rpc("fn_update_customer", {
    p_caller_id: callerUserId,
    p_customer_id: id,
    p_name: validated.name ?? null,
    p_phone: validated.phone ?? null,
    p_email: validated.email ?? null,
    p_address: validated.address ?? null,
    p_emergency_contact: validated.emergency_contact ?? null,
    p_photo_url: validated.photo_url ?? null,
    p_notes: validated.notes ?? null,
    p_is_guest: validated.is_guest ?? null,
    p_tags: validated.tags ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return customer as Customer;
}

export async function deleteCustomer(
  id: string,
  callerUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc("fn_delete_customer", {
    p_caller_id: callerUserId,
    p_customer_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }
}

export async function convertGuest(
  customerId: string,
  username: string,
  pin: string,
  callerUserId: string,
): Promise<{ id: string; is_guest: boolean }> {
  const { data, error } = await supabase.rpc("fn_convert_guest", {
    p_caller_id: callerUserId,
    p_customer_id: customerId,
    p_username: username,
    p_pin: pin,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string; is_guest: boolean };
}
