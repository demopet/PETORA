import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRevenueReport,
  getProfitLossReport,
  getInventoryValuationReport,
} from "./report.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("report.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRevenueReport", () => {
    it("calls fn_get_revenue_report with correct parameters", async () => {
      const mockData = [
        {
          period: "2026-08-18",
          invoice_type: "POS",
          total_revenue: 100000,
          transaction_count: 5,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      } as any);

      const result = await getRevenueReport("2026-08-01", "2026-08-31", "day", VALID_UUID);

      expect(result).toEqual(mockData);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_get_revenue_report", {
        p_start_date: "2026-08-01",
        p_end_date: "2026-08-31",
        p_group_by: "day",
        p_caller_id: VALID_UUID,
      });
    });

    it("throws FORBIDDEN when caller lacks permission", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(getRevenueReport("2026-08-01", "2026-08-31", "day", VALID_UUID)).rejects.toThrow(
        "You do not have permission to perform this action."
      );
    });

    it("throws VALIDATION_ERROR for invalid group_by", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: {
          message: "VALIDATION_ERROR: group_by must be day, week, or month",
          code: "22000",
        },
      } as any);

      await expect(
        getRevenueReport("2026-08-01", "2026-08-31", "week" as "day" | "week" | "month", VALID_UUID)
      ).rejects.toThrow("group_by must be day, week, or month");
    });
  });

  describe("getProfitLossReport", () => {
    it("calls fn_get_profit_loss_report with correct parameters", async () => {
      const mockData = {
        revenue: 1000000,
        cogs: 400000,
        expenses: 200000,
        net_profit: 400000,
        start_date: "2026-08-01",
        end_date: "2026-08-31",
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      } as any);

      const result = await getProfitLossReport("2026-08-01", "2026-08-31", VALID_UUID);

      expect(result).toEqual(mockData);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_get_profit_loss_report", {
        p_start_date: "2026-08-01",
        p_end_date: "2026-08-31",
        p_caller_id: VALID_UUID,
      });
    });
  });

  describe("getInventoryValuationReport", () => {
    it("calls fn_get_inventory_valuation_report with correct parameters", async () => {
      const mockData = {
        total_value: 5000000,
        as_of_date: "2026-08-18",
        items: [
          {
            product_id: VALID_UUID,
            product_name: "Premium Cat Food",
            sku: "CAT-001",
            stock_quantity: 50,
            purchase_price: 100000,
            total_value: 5000000,
          },
        ],
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      } as any);

      const result = await getInventoryValuationReport("2026-08-18", VALID_UUID);

      expect(result).toEqual(mockData);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_get_inventory_valuation_report", {
        p_as_of_date: "2026-08-18",
        p_caller_id: VALID_UUID,
      });
    });
  });
});
