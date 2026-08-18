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
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  AppError,
} from "./medical-record.service";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
  mockAuthGetUser.mockReset();
  mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

describe("medical-record.service", () => {
  describe("createMedicalRecord", () => {
    it("should call fn_create_medical_record with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "record-1" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "record-1",
                appointment_id: VALID_UUID,
                doctor_id: "user-1",
                status: "OPEN",
              },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await createMedicalRecord(
        {
          appointment_id: VALID_UUID,
          chief_complaint: "Coughing",
          diagnosis: "Kennel Cough",
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_create_medical_record", {
        p_caller_id: "user-1",
        p_appointment_id: VALID_UUID,
        p_chief_complaint: "Coughing",
        p_history: null,
        p_physical_exam: null,
        p_weight_kg: null,
        p_temperature_c: null,
        p_heart_rate_bpm: null,
        p_respiratory_rate_bpm: null,
        p_diagnosis: "Kennel Cough",
        p_treatment: null,
        p_prescription: null,
        p_lab_results: null,
        p_additional_notes: null,
        p_attachments: [],
      });
      expect(result.id).toBe("record-1");
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
        createMedicalRecord(
          {
            appointment_id: VALID_UUID,
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateMedicalRecord", () => {
    it("should call fn_update_medical_record with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "record-1" },
        error: null,
      } as any);

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "record-1", diagnosis: "Updated" },
              error: null,
            } as any),
          })),
        })),
      } as any);

      const result = await updateMedicalRecord(
        "record-1",
        { diagnosis: "Updated" },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_update_medical_record", {
        p_caller_id: "user-1",
        p_medical_record_id: "record-1",
        p_chief_complaint: null,
        p_history: null,
        p_physical_exam: null,
        p_weight_kg: null,
        p_temperature_c: null,
        p_heart_rate_bpm: null,
        p_respiratory_rate_bpm: null,
        p_diagnosis: "Updated",
        p_treatment: null,
        p_prescription: null,
        p_lab_results: null,
        p_additional_notes: null,
        p_attachments: null,
      });
      expect(result.id).toBe("record-1");
    });
  });

  describe("deleteMedicalRecord", () => {
    it("should call fn_delete_medical_record with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "record-1" },
        error: null,
      } as any);

      await deleteMedicalRecord("record-1", "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_delete_medical_record", {
        p_caller_id: "user-1",
        p_medical_record_id: "record-1",
      });
    });

    it("should throw AppError on RPC failure", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(deleteMedicalRecord("record-1", "user-1")).rejects.toThrow(
        AppError,
      );
    });
  });
});
