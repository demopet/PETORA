import type { BaseEntity, UUID, Timestamp } from './base';

export type PromotionType = 'PERCENTAGE' | 'FIXED' | 'BUNDLE' | 'HAPPY_HOUR' | 'BIRTHDAY';
export type PromotionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Promotion extends BaseEntity {
  code: string | null;
  name: string;
  description: string | null;
  promotion_type: PromotionType;
  discount_value: number;
  min_purchase: number;
  max_usage: number | null;
  current_usage: number;
  start_date: string;
  end_date: string;
  applicable_products: UUID[] | null;
  status: PromotionStatus;
}

export interface PromotionUsage extends BaseEntity {
  promotion_id: UUID;
  invoice_id: UUID;
  customer_id: UUID | null;
  discount_applied: number;
  used_at: Timestamp;
}

export interface CreatePromotionInput {
  code?: string;
  name: string;
  description?: string;
  promotion_type: PromotionType;
  discount_value: number;
  min_purchase?: number;
  max_usage?: number;
  start_date: string;
  end_date: string;
  applicable_products?: UUID[];
}
