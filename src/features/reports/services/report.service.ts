import { supabase } from "@/lib/supabase/client";

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

export interface RevenueReportItem {
  period: string;
  invoice_type: string;
  total_revenue: number;
  transaction_count: number;
}

export interface ProfitLossReport {
  revenue: number;
  cogs: number;
  expenses: number;
  net_profit: number;
  start_date: string;
  end_date: string;
}

export interface InventoryValuationItem {
  product_id: string;
  product_name: string;
  sku: string;
  stock_quantity: number;
  purchase_price: number;
  total_value: number;
}

export interface InventoryValuationReport {
  total_value: number;
  as_of_date: string;
  items: InventoryValuationItem[];
}

export async function getRevenueReport(
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month",
  callerUserId: string
): Promise<RevenueReportItem[]> {
  const { data, error } = await supabase.rpc("fn_get_revenue_report", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_group_by: groupBy,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as RevenueReportItem[];
}

export async function getProfitLossReport(
  startDate: string,
  endDate: string,
  callerUserId: string
): Promise<ProfitLossReport> {
  const { data, error } = await supabase.rpc("fn_get_profit_loss_report", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as ProfitLossReport;
}

export async function getInventoryValuationReport(
  asOfDate: string,
  callerUserId: string
): Promise<InventoryValuationReport> {
  const { data, error } = await supabase.rpc("fn_get_inventory_valuation_report", {
    p_as_of_date: asOfDate,
    p_caller_id: callerUserId,
  });

  if (error) {
    throw mapPgError(error);
  }

  return data as InventoryValuationReport;
}
