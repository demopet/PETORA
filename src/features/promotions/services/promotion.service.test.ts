import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPromotion,
  updatePromotion,
  cancelPromotion,
  validatePromoCode,
  getPromotions,
} from "./promotion.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("promotion.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPromotion", () => {
    it("calls fn_create_promotion with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await createPromotion(
        {
          name: "Summer Sale",
          promotion_type: "PERCENTAGE",
          discount_value: 20,
          start_date: "2026-06-01",
          end_date: "2026-06-30",
        },
        "user-1"
      );

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_create_promotion", {
        p_caller_id: "user-1",
        p_code: null,
        p_name: "Summer Sale",
        p_description: null,
        p_promotion_type: "PERCENTAGE",
        p_discount_value: 20,
        p_min_purchase: 0,
        p_max_usage: null,
        p_start_date: "2026-06-01",
        p_end_date: "2026-06-30",
        p_applicable_products: null,
      });
    });

    it("throws FORBIDDEN when caller lacks permission", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(
        createPromotion(
          {
            name: "Test",
            promotion_type: "PERCENTAGE",
            discount_value: 10,
            start_date: "2026-06-01",
            end_date: "2026-06-30",
          },
          "user-1"
        )
      ).rejects.toThrow("You do not have permission to perform this action.");
    });

    it("throws CONFLICT when promotion code already exists", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "CONFLICT: promotion code already exists", code: "23505" },
      } as any);

      await expect(
        createPromotion(
          {
            code: "SUMMER",
            name: "Summer Sale",
            promotion_type: "PERCENTAGE",
            discount_value: 20,
            start_date: "2026-06-01",
            end_date: "2026-06-30",
          },
          "user-1"
        )
      ).rejects.toThrow("promotion code already exists");
    });
  });

  describe("updatePromotion", () => {
    it("calls fn_update_promotion with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await updatePromotion(VALID_UUID, { discount_value: 25 }, "user-1");

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_update_promotion", {
        p_caller_id: "user-1",
        p_promotion_id: VALID_UUID,
        p_name: null,
        p_description: null,
        p_discount_value: 25,
        p_min_purchase: null,
        p_max_usage: null,
        p_start_date: null,
        p_end_date: null,
        p_applicable_products: null,
      });
    });

    it("throws PROMO_NOT_FOUND when promotion does not exist", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "PROMO_NOT_FOUND", code: "22000" },
      } as any);

      await expect(updatePromotion(VALID_UUID, { discount_value: 25 }, "user-1")).rejects.toThrow(
        "Promotion not found."
      );
    });
  });

  describe("cancelPromotion", () => {
    it("calls fn_cancel_promotion with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await cancelPromotion(VALID_UUID, "user-1");

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_cancel_promotion", {
        p_caller_id: "user-1",
        p_promotion_id: VALID_UUID,
      });
    });
  });

  describe("validatePromoCode", () => {
    it("calls fn_validate_promo_code with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          valid: true,
          promotion: {
            id: VALID_UUID,
            code: "SUMMER",
            name: "Summer Sale",
            promotion_type: "PERCENTAGE",
            discount_value: 20,
          },
          discount_amount: 20000,
        },
        error: null,
      } as any);

      const result = await validatePromoCode("SUMMER", 100000, "customer-1", "user-1", [
        { product_id: "prod-1" },
      ]);

      expect(result.valid).toBe(true);
      expect(result.discount_amount).toBe(20000);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_validate_promo_code", {
        p_code: "SUMMER",
        p_subtotal: 100000,
        p_customer_id: "customer-1",
        p_items: [{ product_id: "prod-1" }],
        p_caller_id: "user-1",
      });
    });

    it("throws PROMOTION_INVALID for expired promotion", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "PROMOTION_INVALID: Promotion has expired", code: "22000" },
      } as any);

      await expect(validatePromoCode("SUMMER", 100000, null, "user-1", [])).rejects.toThrow(
        "Promotion has expired"
      );
    });

    it("throws PROMO_NOT_FOUND for invalid code", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "PROMO_NOT_FOUND", code: "22000" },
      } as any);

      await expect(validatePromoCode("INVALID", 100000, null, "user-1", [])).rejects.toThrow(
        "Promotion not found."
      );
    });
  });

  describe("getPromotions", () => {
    it("fetches all promotions", async () => {
      const mockPromotions = [
        {
          id: VALID_UUID,
          code: "SUMMER",
          name: "Summer Sale",
          promotion_type: "PERCENTAGE",
          discount_value: 20,
          status: "ACTIVE",
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockPromotions,
          error: null,
        }),
      } as any);

      const result = await getPromotions();
      expect(result).toEqual(mockPromotions);
    });
  });
});
