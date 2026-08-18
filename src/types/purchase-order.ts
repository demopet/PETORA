import type { BaseEntity, UUID } from "./base";

export type PurchaseOrderStatus =
  "DRAFT" | "SENT" | "PARTIAL_RECEIVED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrder extends BaseEntity {
  po_number: string;
  supplier_id: UUID;
  order_date: string;
  expected_arrival_date: string | null;
  actual_arrival_date: string | null;
  total_amount: number;
  status: PurchaseOrderStatus;
  notes: string | null;
  created_by: UUID;
}

export interface PurchaseOrderItem extends BaseEntity {
  po_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price: number;
  received_quantity: number;
}

export interface CreatePurchaseOrderInput {
  supplier_id: UUID;
  order_date: string;
  expected_arrival_date?: string;
  notes?: string;
  items: Array<{
    product_id: UUID;
    quantity: number;
    unit_price: number;
  }>;
}
