import { z } from "zod";
import { uuidSchema, dateSchema, timeSchema } from "./base";

export const createGroomingBookingSchema = z.object({
  pet_id: uuidSchema,
  customer_id: uuidSchema,
  groomer_id: uuidSchema.optional(),
  service_id: uuidSchema,
  appointment_date: dateSchema,
  appointment_time: timeSchema,
  notes: z.string().optional(),
  is_from_portal: z.boolean().default(false),
});

export const startGroomingSchema = z.object({
  booking_id: uuidSchema,
});

export const finishGroomingSchema = z.object({
  booking_id: uuidSchema,
  skin_condition: z.string().optional(),
  flea_tick_found: z.boolean().default(false),
  recommendations: z.string().optional(),
  before_photo_url: z.string().url().optional(),
  after_photo_url: z.string().url().optional(),
});

export const cancelGroomingSchema = z.object({
  booking_id: uuidSchema,
  reason: z.string().optional(),
});

export type CreateGroomingBookingInputSchema = z.infer<
  typeof createGroomingBookingSchema
>;
export type StartGroomingInputSchema = z.infer<typeof startGroomingSchema>;
export type FinishGroomingInputSchema = z.infer<typeof finishGroomingSchema>;
export type CancelGroomingInputSchema = z.infer<typeof cancelGroomingSchema>;
