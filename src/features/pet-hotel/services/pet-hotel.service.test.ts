import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

import {
  createPetHotelBooking,
  checkInBooking,
  checkOutBooking,
  addPetHotelLog,
  cancelPetHotelBooking,
  AppError,
} from "./pet-hotel.service";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";
const BOOKING_ID = "123e4567-e89b-42d3-a456-426614174000";
const ROOM_ID = "22345678-e89b-42d3-a456-426614174001";

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

describe("pet-hotel.service", () => {
  describe("createPetHotelBooking", () => {
    it("should call fn_create_pet_hotel_booking with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID, booking_number: "BK-20250818-0001" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: BOOKING_ID,
                booking_number: "BK-20250818-0001",
                pet_id: VALID_UUID,
                customer_id: VALID_UUID,
                room_id: ROOM_ID,
                check_in_date: "2025-08-19",
                check_out_date: "2025-08-21",
                price_per_night: 150000,
                total_price: 0,
                status: "BOOKED",
                special_notes: null,
                is_from_portal: false,
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await createPetHotelBooking(
        {
          pet_id: VALID_UUID,
          customer_id: VALID_UUID,
          room_id: ROOM_ID,
          check_in_date: "2025-08-19",
          check_out_date: "2025-08-21",
          price_per_night: 150000,
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_create_pet_hotel_booking", {
        p_caller_id: "user-1",
        p_pet_id: VALID_UUID,
        p_customer_id: VALID_UUID,
        p_room_id: ROOM_ID,
        p_check_in_date: "2025-08-19",
        p_check_out_date: "2025-08-21",
        p_price_per_night: 150000,
        p_special_notes: null,
        p_is_from_portal: false,
      });
      expect(result.id).toBe(BOOKING_ID);
    });

    it("should throw AppError on RPC failure", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(
        createPetHotelBooking(
          {
            pet_id: VALID_UUID,
            customer_id: VALID_UUID,
            check_in_date: "2025-08-19",
            check_out_date: "2025-08-21",
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("checkInBooking", () => {
    it("should call fn_check_in_booking with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: BOOKING_ID,
                status: "CHECKED_IN",
                actual_check_in_at: new Date().toISOString(),
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await checkInBooking(BOOKING_ID, "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_check_in_booking", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_actual_room_id: null,
      });
      expect(result.id).toBe(BOOKING_ID);
    });

    it("should call fn_check_in_booking with actual_room_id when provided", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: BOOKING_ID, status: "CHECKED_IN" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      await checkInBooking(BOOKING_ID, "user-1", ROOM_ID);

      expect(mockRpc).toHaveBeenCalledWith("fn_check_in_booking", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_actual_room_id: ROOM_ID,
      });
    });
  });

  describe("checkOutBooking", () => {
    it("should call fn_check_out_booking with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID, total_price: 300000 },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: BOOKING_ID,
                status: "CHECKED_OUT",
                total_price: 300000,
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await checkOutBooking(BOOKING_ID, "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_check_out_booking", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_actual_check_out_date: null,
      });
      expect(result.id).toBe(BOOKING_ID);
    });
  });

  describe("addPetHotelLog", () => {
    it("should call fn_add_pet_hotel_log with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "log-1" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "log-1",
                booking_id: BOOKING_ID,
                log_type: "FEEDING",
                description: "Fed at noon",
                photo_urls: [],
                logged_at: new Date().toISOString(),
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await addPetHotelLog(
        {
          booking_id: BOOKING_ID,
          log_type: "FEEDING",
          description: "Fed at noon",
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_add_pet_hotel_log", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_log_type: "FEEDING",
        p_description: "Fed at noon",
        p_photo_urls: [],
      });
      expect(result.id).toBe("log-1");
    });
  });

  describe("cancelPetHotelBooking", () => {
    it("should call fn_cancel_pet_hotel_booking with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: BOOKING_ID, status: "CANCELLED" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await cancelPetHotelBooking(BOOKING_ID, "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_cancel_pet_hotel_booking", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_reason: null,
      });
      expect(result.id).toBe(BOOKING_ID);
    });
  });
});
