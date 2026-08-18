import { supabase } from "@/lib/supabase/client";
import type { Promotion, CreatePromotionInput } from "@/types/promotion";

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
    return new AppError("You do not have permission to perform this action.", "FORBIDDEN");
  }
  if (msg.includes("PROMOTION_INVALID")) {
    return new AppError(
      msg.includes(": ") ? msg.replace("PROMOTION_INVALID: ", "") : msg,
      "PROMOTION_INVALID"
    );
  }
  if (msg.includes("PROMO_NOT_FOUND")) {
    return new AppError(
      msg.includes(": ") ? msg.replace("PROMO_NOT_FOUND: ", "") : "Promotion not found.",
      "PROMO_NOT_FOUND"
    );
  }
  if (msg.includes("VALIDATION_ERROR")) {
    return new AppError(msg.replace("VALIDATION_ERROR: ", ""), "VALIDATION_ERROR");
  }
  if (error.code === "23505" || msg.includes("CONFLICT")) {
    return new AppError(msg.replace("CONFLICT: ", ""), "CONFLICT");
  }
  if (error.code === "22000") {
    return new AppError(msg, "VALIDATION_ERROR");
  }

  return new AppError(msg, error.code);
}

export async function createPromotion(
  input: CreatePromotionInput,
  callerUserId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_create_promotion", {
    p_caller_id: callerUserId,
    p_code: input.code ?? null,
    p_name: input.name,
    p_description: input.description ?? null,
    p_promotion_type: input.promotion_type,
    p_discount_value: input.discount_value,
    p_min_purchase: input.min_purchase ?? 0,
    p_max_usage: input.max_usage ?? null,
    p_start_date: input.start_date,
    p_end_date: input.end_date,
    p_applicable_products: input.applicable_products ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function updatePromotion(
  id: string,
  input: Partial<CreatePromotionInput>,
  callerUserId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_update_promotion", {
    p_caller_id: callerUserId,
    p_promotion_id: id,
    p_name: input.name ?? null,
    p_description: input.description ?? null,
    p_discount_value: input.discount_value ?? null,
    p_min_purchase: input.min_purchase ?? null,
    p_max_usage: input.max_usage ?? null,
    p_start_date: input.start_date ?? null,
    p_end_date: input.end_date ?? null,
    p_applicable_products: input.applicable_products ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function cancelPromotion(id: string, callerUserId: string): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_cancel_promotion", {
    p_caller_id: callerUserId,
    p_promotion_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function validatePromoCode(
  code: string,
  subtotal: number,
  customerId: string | null,
  callerUserId: string,
  items?: { product_id?: string }[]
): Promise<{
  valid: boolean;
  promotion: {
    id: string;
    code: string | null;
    name: string;
    promotion_type: string;
    discount_value: number;
  };
  discount_amount: number;
}> {
  const itemsJson = items?.map((item) => ({
    product_id: item.product_id ?? null,
  }));

  const { data, error } = await supabase.rpc("fn_validate_promo_code", {
    p_code: code,
    p_subtotal: subtotal,
    p_customer_id: customerId ?? null,
    p_items: itemsJson ?? null,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as {
    valid: boolean;
    promotion: {
      id: string;
      code: string | null;
      name: string;
      promotion_type: string;
      discount_value: number;
    };
    discount_amount: number;
  };
}

export async function getPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data as Promotion[];
}

export async function getPromotion(id: string): Promise<Promotion> {
  const { data, error } = await supabase.from("promotions").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Promotion;
}
