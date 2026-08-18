import type { BaseEntity, UUID } from "./base";

export type FeedbackRating = "1" | "2" | "3" | "4" | "5";

export interface CustomerFeedback extends BaseEntity {
  customer_id: UUID;
  invoice_id: UUID | null;
  rating: FeedbackRating;
  comment: string | null;
  nps_score: number | null;
}

export interface CreateFeedbackInput {
  customer_id: UUID;
  invoice_id?: UUID;
  rating: FeedbackRating;
  comment?: string;
  nps_score?: number;
}
