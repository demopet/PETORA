import { supabase } from "@/lib/supabase/client";
import type { LoyaltyMember, LoyaltyTransaction, LoyaltyTierConfig } from "@/types/loyalty";

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
  if (msg.includes("LOYALTY_MEMBER_NOT_FOUND")) {
    return new AppError(
      msg.includes(": ")
        ? msg.replace("LOYALTY_MEMBER_NOT_FOUND: ", "")
        : "Customer is not enrolled in the loyalty program.",
      "LOYALTY_MEMBER_NOT_FOUND"
    );
  }
  if (msg.includes("INSUFFICIENT_POINTS")) {
    return new AppError(
      msg.includes(": ") ? msg.replace("INSUFFICIENT_POINTS: ", "") : "Not enough loyalty points.",
      "INSUFFICIENT_POINTS"
    );
  }
  if (msg.includes("PROMOTION_INVALID")) {
    return new AppError(msg.replace("PROMOTION_INVALID: ", ""), "PROMOTION_INVALID");
  }
  if (msg.includes("PROMO_NOT_FOUND")) {
    return new AppError(
      msg.replace("PROMO_NOT_FOUND: ", "Promotion not found."),
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

export async function earnLoyaltyPoints(
  customerId: string,
  invoiceId: string,
  totalAmount: number,
  callerUserId: string
): Promise<{ member_id: string; points: number; transaction_id: string | null }> {
  const { data, error } = await supabase.rpc("fn_earn_loyalty_points", {
    p_customer_id: customerId,
    p_invoice_id: invoiceId,
    p_total_amount: totalAmount,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { member_id: string; points: number; transaction_id: string | null };
}

export async function redeemLoyaltyPoints(
  customerId: string,
  pointsToRedeem: number,
  invoiceId: string | null,
  callerUserId: string
): Promise<{
  transaction: {
    id: string;
    member_id: string;
    transaction_type: string;
    points: number;
    invoice_id: string | null;
  };
  discount_value: number;
}> {
  const { data, error } = await supabase.rpc("fn_redeem_loyalty_points", {
    p_customer_id: customerId,
    p_points_to_redeem: pointsToRedeem,
    p_invoice_id: invoiceId,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as {
    transaction: {
      id: string;
      member_id: string;
      transaction_type: string;
      points: number;
      invoice_id: string | null;
    };
    discount_value: number;
  };
}

export async function reverseLoyaltyPoints(
  transactionId: string,
  callerUserId: string
): Promise<{ reversed: boolean; transaction_id: string }> {
  const { data, error } = await supabase.rpc("fn_reverse_loyalty_points", {
    p_transaction_id: transactionId,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { reversed: boolean; transaction_id: string };
}

export async function checkTierUpgrade(
  memberId: string,
  callerUserId: string
): Promise<{ upgraded: boolean; new_tier?: string }> {
  const { data, error } = await supabase.rpc("fn_check_tier_upgrade", {
    p_member_id: memberId,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { upgraded: boolean; new_tier?: string };
}

export async function getLoyaltyMembers(): Promise<
  (LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig })[]
> {
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*, loyalty_tiers(*)")
    .order("total_points", { ascending: false });

  if (error) throw error;
  return data as (LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig })[];
}

export async function getLoyaltyMember(
  customerId: string
): Promise<LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig }> {
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*, loyalty_tiers(*)")
    .eq("customer_id", customerId)
    .single();

  if (error) throw error;
  return data as LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig };
}

export async function getLoyaltyTransactions(memberId: string): Promise<LoyaltyTransaction[]> {
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LoyaltyTransaction[];
}
