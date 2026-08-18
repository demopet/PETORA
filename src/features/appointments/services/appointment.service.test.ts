import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRpc, mockFrom, mockAuthGetUser } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockAuthGetUser: vi
    .fn()
    .mockResolvedValue({ data: { user: { id: "user-1" } } }),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  },
}));

import {
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  AppError,
} from "./appointment.service";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
  mockAuthGetUser.mockReset();
  mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

describe("appointment.service", () => {
  describe("createAppointment", () => {
    it("should call fn_create_appointment with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "apt-1" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "apt-1",
                customer_id: VALID_UUID,
                pet_id: VALID_UUID,
                appointment_date: "2025-01-01",
                appointment_time: "10:00",
                status: "WAITING",
                queue_number: 1,
                is_active: true,
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await createAppointment(
        {
          customer_id: VALID_UUID,
          pet_id: VALID_UUID,
          appointment_date: "2025-01-01",
          appointment_time: "10:00",
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_create_appointment", {
        p_caller_id: "user-1",
        p_customer_id: VALID_UUID,
        p_pet_id: VALID_UUID,
        p_doctor_id: null,
        p_appointment_date: "2025-01-01",
        p_appointment_time: "10:00",
        p_complaint: null,
        p_notes: null,
        p_is_from_portal: false,
      });
      expect(result.id).toBe("apt-1");
    });

    it("should throw AppError on RPC failure", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      } as any);

      await expect(
        createAppointment(
          {
            customer_id: VALID_UUID,
            pet_id: VALID_UUID,
            appointment_date: "2025-01-01",
            appointment_time: "10:00",
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateAppointmentStatus", () => {
    it("should call fn_update_appointment_status and return prompt flag", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "apt-1", prompt_create_medical_record: true },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "apt-1", status: "DONE" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await updateAppointmentStatus(
        "apt-1",
        { status: "DONE" },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_update_appointment_status", {
        p_caller_id: "user-1",
        p_appointment_id: "apt-1",
        p_new_status: "DONE",
      });
      expect(result.promptCreateMedicalRecord).toBe(true);
    });
  });

  describe("cancelAppointment", () => {
    it("should call fn_cancel_appointment with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "apt-1" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "apt-1", status: "CANCELLED" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await cancelAppointment(
        "apt-1",
        "user-1",
        "Customer requested",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_cancel_appointment", {
        p_caller_id: "user-1",
        p_appointment_id: "apt-1",
        p_reason: "Customer requested",
      });
      expect(result.id).toBe("apt-1");
    });
  });
});
