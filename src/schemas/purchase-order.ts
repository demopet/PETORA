import { z } from "zod";
import { uuidSchema, dateSchema } from "./base";

export const purchaseOrderStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "PARTIAL_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export const createPurchaseOrderSchema = z.object({
  supplier_id: uuidSchema,
  order_date: dateSchema,
  expected_arrival_date: dateSchema.nullable().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: uuidSchema,
      quantity: z.number().int().positive(),
      unit_price: z.number().nonnegative(),
    })
  ),
});

export const updatePurchaseOrderSchema = z.object({
  status: purchaseOrderStatusSchema.optional(),
  notes: z.string().optional(),
});

export type CreatePurchaseOrderInput = z.infer<
  typeof createPurchaseOrderSchema
>;
export type UpdatePurchaseOrderInput = z.infer<
  typeof updatePurchaseOrderSchema
>;
