import type { BaseEntity, UUID } from "./base";

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVERSED";

export interface ExpenseCategory extends BaseEntity {
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Expense extends BaseEntity {
  expense_date: string;
  category_id: UUID;
  amount: number;
  description: string | null;
  receipt_url: string | null;
  status: ExpenseStatus;
  is_recurring: boolean;
  recurring_day: number | null;
  created_by: UUID;
  approved_by: UUID | null;
}

export interface CreateExpenseInput {
  expense_date: string;
  category_id: UUID;
  amount: number;
  description?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_day?: number;
}
