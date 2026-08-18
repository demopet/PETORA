import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  earnLoyaltyPoints,
  redeemLoyaltyPoints,
  reverseLoyaltyPoints,
  checkTierUpgrade,
  getLoyaltyMembers,
  getLoyaltyTransactions,
} from "./loyalty.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("loyalty.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("earnLoyaltyPoints", () => {
    it("calls fn_earn_loyalty_points with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { member_id: VALID_UUID, points: 10, transaction_id: VALID_UUID },
        error: null,
      } as any);

      const result = await earnLoyaltyPoints("customer-1", "invoice-1", 150000, "user-1");

      expect(result).toEqual({
        member_id: VALID_UUID,
        points: 10,
        transaction_id: VALID_UUID,
      });
      expect(supabase.rpc).toHaveBeenCalledWith("fn_earn_loyalty_points", {
        p_customer_id: "customer-1",
        p_invoice_id: "invoice-1",
        p_total_amount: 150000,
        p_caller_id: "user-1",
      });
    });

    it("throws FORBIDDEN when caller lacks permission", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(earnLoyaltyPoints("customer-1", "invoice-1", 150000, "user-1")).rejects.toThrow(
        "You do not have permission to perform this action."
      );
    });

    it("throws LOYALTY_MEMBER_NOT_FOUND when customer not enrolled", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "LOYALTY_MEMBER_NOT_FOUND", code: "22000" },
      } as any);

      await expect(earnLoyaltyPoints("customer-1", "invoice-1", 150000, "user-1")).rejects.toThrow(
        "Customer is not enrolled in the loyalty program."
      );
    });
  });

  describe("redeemLoyaltyPoints", () => {
    it("calls fn_redeem_loyalty_points with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          transaction: {
            id: VALID_UUID,
            member_id: VALID_UUID,
            transaction_type: "REDEEM",
            points: -50,
            invoice_id: "invoice-1",
          },
          discount_value: 5000,
        },
        error: null,
      } as any);

      const result = await redeemLoyaltyPoints("customer-1", 50, "invoice-1", "user-1");

      expect(result.discount_value).toBe(5000);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_redeem_loyalty_points", {
        p_customer_id: "customer-1",
        p_points_to_redeem: 50,
        p_invoice_id: "invoice-1",
        p_caller_id: "user-1",
      });
    });

    it("throws INSUFFICIENT_POINTS when not enough points", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "INSUFFICIENT_POINTS", code: "22000" },
      } as any);

      await expect(redeemLoyaltyPoints("customer-1", 50, "invoice-1", "user-1")).rejects.toThrow(
        "Not enough loyalty points."
      );
    });
  });

  describe("reverseLoyaltyPoints", () => {
    it("calls fn_reverse_loyalty_points with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { reversed: true, transaction_id: VALID_UUID },
        error: null,
      } as any);

      const result = await reverseLoyaltyPoints(VALID_UUID, "user-1");

      expect(result.reversed).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_reverse_loyalty_points", {
        p_transaction_id: VALID_UUID,
        p_caller_id: "user-1",
      });
    });
  });

  describe("checkTierUpgrade", () => {
    it("calls fn_check_tier_upgrade with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { upgraded: true, new_tier: "GOLD" },
        error: null,
      } as any);

      const result = await checkTierUpgrade(VALID_UUID, "user-1");

      expect(result.upgraded).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_check_tier_upgrade", {
        p_member_id: VALID_UUID,
        p_caller_id: "user-1",
      });
    });
  });

  describe("getLoyaltyMembers", () => {
    it("fetches loyalty members with tier info", async () => {
      const mockMembers = [
        {
          id: VALID_UUID,
          customer_id: "cust-1",
          tier_id: VALID_UUID,
          total_points: 100,
          available_points: 100,
          total_spending: 500000,
          joined_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          loyalty_tiers: {
            id: VALID_UUID,
            tier_name: "GOLD",
            min_points: 50,
            min_spending: 100000,
            point_multiplier: 1.5,
            benefits: {},
            created_at: "2026-01-01T00:00:00Z",
          },
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockMembers,
          error: null,
        }),
      } as any);

      const result = await getLoyaltyMembers();
      expect(result).toEqual(mockMembers);
    });
  });

  describe("getLoyaltyTransactions", () => {
    it("fetches transactions for a member", async () => {
      const mockTransactions = [
        {
          id: VALID_UUID,
          member_id: VALID_UUID,
          transaction_type: "EARN",
          points: 10,
          invoice_id: "invoice-1",
          description: "Test",
          created_at: "2026-01-01T00:00:00Z",
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockTransactions,
          error: null,
        }),
      } as any);

      const result = await getLoyaltyTransactions(VALID_UUID);
      expect(result).toEqual(mockTransactions);
    });
  });
});
