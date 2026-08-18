import { z } from "zod";
import { uuidSchema } from "./base";

export const feedbackRatingSchema = z.enum(["1", "2", "3", "4", "5"]);

export const createFeedbackSchema = z.object({
  customer_id: uuidSchema,
  invoice_id: uuidSchema.nullable().optional(),
  rating: feedbackRatingSchema,
  comment: z.string().optional(),
  nps_score: z.number().int().min(0).max(10).nullable().optional(),
});

export const updateFeedbackSchema = z.object({
  rating: feedbackRatingSchema.optional(),
  comment: z.string().optional(),
  nps_score: z.number().int().min(0).max(10).nullable().optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
