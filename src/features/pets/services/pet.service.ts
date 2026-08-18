import { supabase } from "@/lib/supabase/client";
import { createPetSchema, updatePetSchema } from "@/schemas/pet";
import type { CreatePetInput, UpdatePetInput, Pet } from "@/types/pet";

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

export async function createPet(
  input: CreatePetInput,
  callerUserId: string,
): Promise<Pet> {
  const validated = createPetSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_create_pet", {
    p_caller_id: callerUserId,
    p_customer_id: validated.customer_id,
    p_name: validated.name,
    p_species: validated.species,
    p_breed: validated.breed ?? null,
    p_birth_date: validated.birth_date ?? null,
    p_gender: validated.gender ?? null,
    p_photo_url: validated.photo_url ?? null,
    p_microchip_number: validated.microchip_number ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: pet, error: fetchError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", data!.id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return pet as Pet;
}

export async function updatePet(
  id: string,
  input: UpdatePetInput,
  callerUserId: string,
): Promise<Pet> {
  const validated = updatePetSchema.parse(input);

  const { error } = await supabase.rpc("fn_update_pet", {
    p_caller_id: callerUserId,
    p_pet_id: id,
    p_name: validated.name ?? null,
    p_species: validated.species ?? null,
    p_breed: validated.breed ?? null,
    p_birth_date: validated.birth_date ?? null,
    p_gender: validated.gender ?? null,
    p_photo_url: validated.photo_url ?? null,
    p_microchip_number: validated.microchip_number ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const { data: pet, error: fetchError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw mapPgError(fetchError);
  }

  return pet as Pet;
}

export async function deletePet(
  id: string,
  callerUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc("fn_delete_pet", {
    p_caller_id: callerUserId,
    p_pet_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }
}
