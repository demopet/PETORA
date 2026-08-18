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
  createGroomingBooking,
  startGrooming,
  finishGrooming,
  cancelGrooming,
  AppError,
} from "./grooming.service";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";
const BOOKING_ID = "123e4567-e89b-42d3-a456-426614174000";
const SERVICE_ID = "32345678-e89b-42d3-a456-426614174002";

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

describe("grooming.service", () => {
  describe("createGroomingBooking", () => {
    it("should call fn_create_grooming_booking with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID, booking_number: "GR-20250818-0001" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: BOOKING_ID,
                booking_number: "GR-20250818-0001",
                pet_id: VALID_UUID,
                customer_id: VALID_UUID,
                groomer_id: VALID_UUID,
                service_id: SERVICE_ID,
                appointment_date: "2025-08-19",
                appointment_time: "10:00",
                status: "BOOKED",
                total_price: 250000,
                notes: null,
                is_from_portal: false,
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await createGroomingBooking(
        {
          pet_id: VALID_UUID,
          customer_id: VALID_UUID,
          groomer_id: VALID_UUID,
          service_id: SERVICE_ID,
          appointment_date: "2025-08-19",
          appointment_time: "10:00",
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_create_grooming_booking", {
        p_caller_id: "user-1",
        p_pet_id: VALID_UUID,
        p_customer_id: VALID_UUID,
        p_groomer_id: VALID_UUID,
        p_service_id: SERVICE_ID,
        p_appointment_date: "2025-08-19",
        p_appointment_time: "10:00",
        p_notes: null,
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
        createGroomingBooking(
          {
            pet_id: VALID_UUID,
            customer_id: VALID_UUID,
            service_id: SERVICE_ID,
            appointment_date: "2025-08-19",
            appointment_time: "10:00",
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("startGrooming", () => {
    it("should call fn_start_grooming with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: BOOKING_ID },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: BOOKING_ID, status: "IN_PROGRESS" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await startGrooming(BOOKING_ID, "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_start_grooming", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
      });
      expect(result.id).toBe(BOOKING_ID);
    });
  });

  describe("finishGrooming", () => {
    it("should call fn_finish_grooming with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          id: BOOKING_ID,
          record_id: "record-1",
          invoice_id: "invoice-1",
        },
        error: null,
      } as any);

      const mockBookingFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: BOOKING_ID, status: "DONE" },
              error: null,
            } as any),
          })),
        })),
      }));

      const mockRecordFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "record-1", booking_id: BOOKING_ID },
              error: null,
            } as any),
          })),
        })),
      }));

      mockFrom.mockReturnValueOnce(mockBookingFrom() as any);
      mockFrom.mockReturnValueOnce(mockRecordFrom() as any);

      const result = await finishGrooming(
        BOOKING_ID,
        {
          booking_id: BOOKING_ID,
          skin_condition: "Healthy",
          flea_tick_found: false,
          recommendations: "Regular grooming",
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_finish_grooming", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_skin_condition: "Healthy",
        p_flea_tick_found: false,
        p_recommendations: "Regular grooming",
        p_before_photo_url: null,
        p_after_photo_url: null,
      });
      expect(result.booking.id).toBe(BOOKING_ID);
      expect(result.record.id).toBe("record-1");
    });
  });

  describe("cancelGrooming", () => {
    it("should call fn_cancel_grooming with correct parameters", async () => {
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

      const result = await cancelGrooming(
        BOOKING_ID,
        "user-1",
        "Customer requested",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_cancel_grooming", {
        p_caller_id: "user-1",
        p_booking_id: BOOKING_ID,
        p_reason: "Customer requested",
      });
      expect(result.id).toBe(BOOKING_ID);
    });
  });
});
