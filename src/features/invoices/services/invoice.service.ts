import { supabase } from "@/lib/supabase/client";
import {
  createInvoiceSchema,
  recordPaymentSchema,
} from "@/schemas/invoice";
import type {
  Invoice,
  InvoiceItem,
  CreateInvoiceInput,
  RecordPaymentInput,
} from "@/types/invoice";

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
    const clean = msg.replace("VALIDATION_ERROR: ", "");
    return new AppError(clean, "VALIDATION_ERROR");
  }
  if (msg.includes("INSUFFICIENT_STOCK")) {
    return new AppError(msg.replace("INSUFFICIENT_STOCK: ", ""), "INSUFFICIENT_STOCK");
  }
  if (msg.includes("PROMOTION_INVALID")) {
    return new AppError(msg.replace("PROMOTION_INVALID: ", ""), "PROMOTION_INVALID");
  }
  if (msg.includes("INSUFFICIENT_LOYALTY_POINTS")) {
    return new AppError(msg.replace("INSUFFICIENT_LOYALTY_POINTS: ", ""), "INSUFFICIENT_LOYALTY_POINTS");
  }
  if (msg.includes("INVOICE_CANCELLED")) {
    return new AppError(msg.replace("INVOICE_CANCELLED: ", ""), "INVOICE_CANCELLED");
  }
  if (msg.includes("INVOICE_ALREADY_PAID")) {
    return new AppError(msg.replace("INVOICE_ALREADY_PAID: ", ""), "INVOICE_ALREADY_PAID");
  }
  if (msg.includes("NO_LOYALTY_ACCOUNT")) {
    return new AppError(msg.replace("NO_LOYALTY_ACCOUNT: ", ""), "NO_LOYALTY_ACCOUNT");
  }
  if (msg.includes("PROMOTION_NOT_FOUND")) {
    return new AppError(msg.replace("PROMOTION_NOT_FOUND: ", ""), "PROMOTION_NOT_FOUND");
  }
  if (error.code === "23505" || msg.includes("CONFLICT")) {
    return new AppError(msg.replace("CONFLICT: ", ""), "CONFLICT");
  }
  if (msg.includes("INVOICE_NOT_FOUND")) {
    return new AppError(msg.replace("INVOICE_NOT_FOUND: ", ""), "INVOICE_NOT_FOUND");
  }
  if (msg.includes("ALREADY_CANCELLED")) {
    return new AppError(msg.replace("ALREADY_CANCELLED: ", ""), "ALREADY_CANCELLED");
  }

  return new AppError(msg, error.code);
}

export async function createInvoice(
  input: CreateInvoiceInput,
  callerUserId: string,
): Promise<Invoice & { items: InvoiceItem[] }> {
  const validated = createInvoiceSchema.parse(input);

  const itemsJson = validated.items.map((item) => ({
    item_type: item.item_type,
    product_id: item.product_id ?? null,
    procedure_id: item.procedure_id ?? null,
    pet_hotel_booking_id: item.pet_hotel_booking_id ?? null,
    grooming_booking_id: item.grooming_booking_id ?? null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { data, error } = await supabase.rpc("fn_create_invoice", {
    p_caller_id: callerUserId,
    p_invoice_type: validated.invoice_type,
    p_customer_id: validated.customer_id ?? null,
    p_items: itemsJson,
    p_discount_amount: validated.discount_amount,
    p_tax_amount: validated.tax_amount,
    p_promotion_id: validated.promotion_id ?? null,
    p_loyalty_points_to_redeem: validated.loyalty_points_to_redeem,
    p_notes: validated.notes ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const result = data as unknown as Invoice & { items: InvoiceItem[] };
  return result;
}

export async function recordPayment(
  invoiceId: string,
  input: RecordPaymentInput,
  callerUserId: string,
): Promise<{ payment: unknown; invoice: Invoice }> {
  const validated = recordPaymentSchema.parse(input);

  const { data, error } = await supabase.rpc("fn_record_payment", {
    p_caller_id: callerUserId,
    p_invoice_id: invoiceId,
    p_payment_method: validated.payment_method,
    p_amount: validated.amount,
    p_reference_number: validated.reference_number ?? null,
    p_notes: validated.notes ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  const result = data as unknown as { payment: unknown; invoice: Invoice };
  return result;
}

export async function cancelInvoice(
  invoiceId: string,
  callerUserId: string,
  reason?: string,
): Promise<Invoice> {
  const { data, error } = await supabase.rpc("fn_cancel_invoice", {
    p_caller_id: callerUserId,
    p_invoice_id: invoiceId,
    p_reason: reason ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as unknown as Invoice;
}

export async function getDailySales(
  date: string,
  callerUserId: string,
): Promise<{
  date: string;
  total_sales: number;
  total_transactions: number;
  total_items: number;
}> {
  const { data, error } = await supabase.rpc("fn_get_daily_sales", {
    p_caller_id: callerUserId,
    p_date: date,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as unknown as {
    date: string;
    total_sales: number;
    total_transactions: number;
    total_items: number;
  };
}
