import type { BaseEntity, UUID, Timestamp } from "./base";

export type InvoiceType =
  "POS" | "CLINICAL" | "PET_HOTEL" | "GROOMING" | "MIXED";
export type InvoiceStatus = "UNPAID" | "PARTIAL_PAYMENT" | "PAID" | "CANCELLED";
export type PaymentMethod =
  "CASH" | "QRIS" | "TRANSFER" | "E_WALLET" | "CREDIT_CARD" | "MIXED";

export interface Invoice extends BaseEntity {
  invoice_number: string;
  invoice_type: InvoiceType;
  customer_id: UUID | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  promotion_id: UUID | null;
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  notes: string | null;
  created_by: UUID;
}

export interface InvoiceItem extends BaseEntity {
  invoice_id: UUID;
  item_type: string;
  product_id: UUID | null;
  procedure_id: UUID | null;
  pet_hotel_booking_id: UUID | null;
  grooming_booking_id: UUID | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment extends BaseEntity {
  invoice_id: UUID;
  payment_method: PaymentMethod;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  created_by: UUID;
}

export interface CreateInvoiceInput {
  invoice_type: InvoiceType;
  customer_id?: UUID;
  items: Array<{
    item_type: string;
    product_id?: UUID;
    procedure_id?: UUID;
    pet_hotel_booking_id?: UUID;
    grooming_booking_id?: UUID;
    description: string;
    quantity?: number;
    unit_price: number;
  }>;
  discount_amount?: number;
  tax_amount?: number;
  promotion_id?: UUID;
  loyalty_points_to_redeem?: number;
  notes?: string;
}

export interface RecordPaymentInput {
  invoice_id: UUID;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string;
  notes?: string;
}

export interface CashShift extends BaseEntity {
  kasir_id: UUID;
  open_time: Timestamp;
  close_time: Timestamp | null;
  opening_cash: number;
  closing_cash: number | null;
  expected_cash: number | null;
  difference: number | null;
  notes: string | null;
}
