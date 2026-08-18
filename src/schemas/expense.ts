import { z } from "zod";
import { uuidSchema, dateSchema } from "./base";

export const expenseStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVERSED",
]);

export const createExpenseSchema = z.object({
  expense_date: dateSchema,
  category_id: uuidSchema,
  amount: z.number().nonnegative(),
  description: z.string().optional(),
  receipt_url: z.string().url().optional(),
  is_recurring: z.boolean().default(false),
  recurring_day: z.number().int().min(1).max(31).nullable().optional(),
});

export const updateExpenseSchema = z.object({
  status: expenseStatusSchema.optional(),
  amount: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
