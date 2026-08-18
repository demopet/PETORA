import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  reverseExpense,
  getExpenses,
} from "./expense.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("expense.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createExpense", () => {
    it("calls fn_create_expense with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await createExpense(
        {
          expense_date: "2026-08-18",
          category_id: VALID_UUID,
          amount: 500000,
          description: "Office supplies",
        },
        "user-1"
      );

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_create_expense", {
        p_caller_id: "user-1",
        p_expense_date: "2026-08-18",
        p_category_id: VALID_UUID,
        p_amount: 500000,
        p_description: "Office supplies",
        p_receipt_url: null,
        p_is_recurring: false,
        p_recurring_day: null,
      });
    });

    it("throws FORBIDDEN when caller lacks permission", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(
        createExpense(
          {
            expense_date: "2026-08-18",
            category_id: VALID_UUID,
            amount: 500000,
          },
          "user-1"
        )
      ).rejects.toThrow("You do not have permission to perform this action.");
    });

    it("throws VALIDATION_ERROR for future expense date", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: {
          message: "VALIDATION_ERROR: Expense date cannot be in the future",
          code: "22000",
        },
      } as any);

      await expect(
        createExpense(
          {
            expense_date: "2099-12-31",
            category_id: VALID_UUID,
            amount: 500000,
          },
          "user-1"
        )
      ).rejects.toThrow("Expense date cannot be in the future");
    });
  });

  describe("updateExpense", () => {
    it("calls fn_update_expense with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await updateExpense(
        VALID_UUID,
        { amount: 600000, description: "Updated description" },
        "user-1"
      );

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_update_expense", {
        p_caller_id: "user-1",
        p_expense_id: VALID_UUID,
        p_status: null,
        p_amount: 600000,
        p_description: "Updated description",
      });
    });
  });

  describe("approveExpense", () => {
    it("calls fn_approve_expense with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await approveExpense(VALID_UUID, "user-1");

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_approve_expense", {
        p_caller_id: "user-1",
        p_expense_id: VALID_UUID,
      });
    });
  });

  describe("rejectExpense", () => {
    it("calls fn_reject_expense with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await rejectExpense(VALID_UUID, "user-1");

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_reject_expense", {
        p_caller_id: "user-1",
        p_expense_id: VALID_UUID,
      });
    });
  });

  describe("reverseExpense", () => {
    it("calls fn_reverse_expense with correct parameters", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      } as any);

      const result = await reverseExpense(VALID_UUID, "Duplicate entry", "user-1");

      expect(result.id).toBe(VALID_UUID);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_reverse_expense", {
        p_caller_id: "user-1",
        p_expense_id: VALID_UUID,
        p_reason: "Duplicate entry",
      });
    });
  });

  describe("getExpenses", () => {
    it("fetches all expenses", async () => {
      const mockExpenses = [
        {
          id: VALID_UUID,
          expense_date: "2026-08-18",
          category_id: VALID_UUID,
          amount: 500000,
          status: "PENDING",
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockExpenses,
          error: null,
        }),
      } as any);

      const result = await getExpenses();
      expect(result).toEqual(mockExpenses);
    });
  });
});
