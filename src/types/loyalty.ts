import type { BaseEntity, UUID, Timestamp } from './base';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';

export interface LoyaltyTierConfig extends BaseEntity {
  tier_name: LoyaltyTier;
  min_points: number;
  min_spending: number;
  point_multiplier: number;
  benefits: Record<string, unknown>;
}

export interface LoyaltyMember extends BaseEntity {
  customer_id: UUID;
  tier_id: UUID | null;
  total_points: number;
  available_points: number;
  total_spending: number;
  joined_at: Timestamp;
}

export interface LoyaltyTransaction extends BaseEntity {
  member_id: UUID;
  transaction_type: LoyaltyTransactionType;
  points: number;
  invoice_id: UUID | null;
  description: string | null;
}
