import { z } from "zod";
import { uuidSchema, dateSchema } from "./base";

export const createPetHotelBookingSchema = z.object({
  pet_id: uuidSchema,
  customer_id: uuidSchema,
  room_id: uuidSchema.optional(),
  check_in_date: dateSchema,
  check_out_date: dateSchema,
  price_per_night: z.number().nonnegative().optional(),
  special_notes: z.string().optional(),
  is_from_portal: z.boolean().default(false),
});

export const checkInBookingSchema = z.object({
  booking_id: uuidSchema,
  actual_room_id: uuidSchema.optional(),
});

export const checkOutBookingSchema = z.object({
  booking_id: uuidSchema,
  actual_check_out_date: dateSchema.optional(),
});

export const addPetHotelLogSchema = z.object({
  booking_id: uuidSchema,
  log_type: z.enum(["FEEDING", "MEDICINE", "NOTE"]),
  description: z.string().optional(),
  photo_urls: z.array(z.string().url()).default([]),
});

export type CreatePetHotelBookingInputSchema = z.infer<
  typeof createPetHotelBookingSchema
>;
export type CheckInBookingInputSchema = z.infer<typeof checkInBookingSchema>;
export type CheckOutBookingInputSchema = z.infer<typeof checkOutBookingSchema>;
export type AddPetHotelLogInputSchema = z.infer<typeof addPetHotelLogSchema>;
