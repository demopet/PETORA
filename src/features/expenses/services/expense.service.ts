import { supabase } from "@/lib/supabase/client";
import type { Expense, CreateExpenseInput } from "@/types/expense";

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
  if (msg.includes("VALIDATION_ERROR")) {
    return new AppError(msg.replace("VALIDATION_ERROR: ", ""), "VALIDATION_ERROR");
  }
  if (error.code === "22000") {
    return new AppError(msg, "VALIDATION_ERROR");
  }

  return new AppError(msg, error.code);
}

export async function createExpense(
  input: CreateExpenseInput,
  callerUserId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_create_expense", {
    p_caller_id: callerUserId,
    p_expense_date: input.expense_date,
    p_category_id: input.category_id,
    p_amount: input.amount,
    p_description: input.description ?? null,
    p_receipt_url: input.receipt_url ?? null,
    p_is_recurring: input.is_recurring ?? false,
    p_recurring_day: input.recurring_day ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function updateExpense(
  id: string,
  input: { status?: string; amount?: number; description?: string },
  callerUserId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_update_expense", {
    p_caller_id: callerUserId,
    p_expense_id: id,
    p_status: input.status ?? null,
    p_amount: input.amount ?? null,
    p_description: input.description ?? null,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function approveExpense(id: string, callerUserId: string): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_approve_expense", {
    p_caller_id: callerUserId,
    p_expense_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function rejectExpense(id: string, callerUserId: string): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_reject_expense", {
    p_caller_id: callerUserId,
    p_expense_id: id,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function reverseExpense(
  id: string,
  reason: string,
  callerUserId: string
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("fn_reverse_expense", {
    p_caller_id: callerUserId,
    p_expense_id: id,
    p_reason: reason,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as { id: string };
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function getExpense(id: string): Promise<Expense> {
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Expense;
}
