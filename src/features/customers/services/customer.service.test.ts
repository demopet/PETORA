import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  convertGuest,
  AppError,
} from "./customer.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

const mockSupabaseRpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("customer.service", () => {
  describe("createCustomer", () => {
    it("should call fn_create_customer with correct parameters", async () => {
      const mockData = { id: "customer-1" };
      mockSupabaseRpc.mockResolvedValueOnce({
        data: mockData,
        error: null,
      } as any);

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "customer-1", name: "Test" },
              error: null,
            } as any),
          })),
        })),
      }));
      vi.mocked(supabase).from = mockFrom as any;

      const result = await createCustomer(
        {
          name: "Test Customer",
          phone: "081234567890",
          email: "test@example.com",
        },
        "user-1",
      );

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_create_customer", {
        p_caller_id: "user-1",
        p_name: "Test Customer",
        p_phone: "081234567890",
        p_email: "test@example.com",
        p_address: null,
        p_emergency_contact: null,
        p_photo_url: null,
        p_notes: null,
        p_is_guest: false,
        p_tags: [],
        p_create_account: false,
        p_username: null,
        p_pin: null,
      });
      expect(result).toEqual({ id: "customer-1", name: "Test" });
    });

    it("should throw AppError on RPC failure", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(createCustomer({ name: "Test" }, "user-1")).rejects.toThrow(
        AppError,
      );
    });

    it("should throw AppError with FORBIDDEN code for permission errors", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      try {
        await createCustomer({ name: "Test" }, "user-1");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe("FORBIDDEN");
      }
    });
  });

  describe("updateCustomer", () => {
    it("should call fn_update_customer with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: { id: "customer-1" },
        error: null,
      } as any);

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "customer-1", name: "Updated" },
              error: null,
            } as any),
          })),
        })),
      }));
      vi.mocked(supabase).from = mockFrom as any;

      const result = await updateCustomer(
        "customer-1",
        { name: "Updated Name" },
        "user-1",
      );

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_update_customer", {
        p_caller_id: "user-1",
        p_customer_id: "customer-1",
        p_name: "Updated Name",
        p_phone: null,
        p_email: null,
        p_address: null,
        p_emergency_contact: null,
        p_photo_url: null,
        p_notes: null,
        p_is_guest: false,
        p_tags: [],
      });
      expect(result).toEqual({ id: "customer-1", name: "Updated" });
    });
  });

  describe("deleteCustomer", () => {
    it("should call fn_delete_customer with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({ data: null, error: null } as any);

      await deleteCustomer("customer-1", "user-1");

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_delete_customer", {
        p_caller_id: "user-1",
        p_customer_id: "customer-1",
      });
    });
  });

  describe("convertGuest", () => {
    it("should call fn_convert_guest with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: { id: "customer-1", is_guest: false },
        error: null,
      } as any);

      const result = await convertGuest(
        "customer-1",
        "newuser",
        "123456",
        "user-1",
      );

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_convert_guest", {
        p_caller_id: "user-1",
        p_customer_id: "customer-1",
        p_username: "newuser",
        p_pin: "123456",
      });
      expect(result).toEqual({ id: "customer-1", is_guest: false });
    });
  });
});
