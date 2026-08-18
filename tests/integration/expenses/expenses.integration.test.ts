import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("expenses integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let expenseId: string;
  let categoryId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "expense-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Expense Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "expense-test-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "Expense Test Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;

    const categoryResult = await supabase
      .from("expense_categories")
      .insert({
        name: "Test Category",
        description: "Test expense category",
        is_active: true,
      })
      .select()
      .single();

    if (categoryResult.data) {
      categoryId = categoryResult.data.id;
    }
  });

  afterAll(async () => {
    if (expenseId) {
      await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .catch(() => {});
    }
    if (categoryId) {
      await supabase
        .from("expense_categories")
        .delete()
        .eq("id", categoryId)
        .catch(() => {});
    }
    const usersToDelete = [adminUserId, ownerUserId].filter(Boolean);
    for (const uid of usersToDelete) {
      await supabase
        .from("users")
        .delete()
        .eq("id", uid)
        .catch(() => {});
    }
  });

  describe("fn_create_expense", () => {
    it("creates an expense", async () => {
      const result = await supabase.rpc("fn_create_expense", {
        p_caller_id: adminUserId,
        p_expense_date: "2026-08-18",
        p_category_id: categoryId,
        p_amount: 500000,
        p_description: "Test expense",
        p_is_recurring: false,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();

      if (result.data) {
        expenseId = result.data.id as string;
      }
    });

    it("throws FORBIDDEN for unauthorized caller", async () => {
      const kasirResult = await supabase.rpc("fn_auth_create_user", {
        p_username: "expense-test-kasir",
        p_pin: "123456",
        p_role: "KASIR",
        p_full_name: "Expense Test Kasir",
        p_created_by: ownerUserId,
      });

      if (kasirResult.data) {
        const result = await supabase.rpc("fn_create_expense", {
          p_caller_id: kasirResult.data as string,
          p_expense_date: "2026-08-18",
          p_category_id: categoryId,
          p_amount: 500000,
        });

        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("42501");
      }
    });

    it("throws VALIDATION_ERROR for future expense date", async () => {
      const result = await supabase.rpc("fn_create_expense", {
        p_caller_id: adminUserId,
        p_expense_date: "2099-12-31",
        p_category_id: categoryId,
        p_amount: 500000,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("22000");
    });
  });

  describe("fn_update_expense", () => {
    it("updates a pending expense", async () => {
      const result = await supabase.rpc("fn_update_expense", {
        p_caller_id: adminUserId,
        p_expense_id: expenseId,
        p_amount: 600000,
        p_description: "Updated description",
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });
  });

  describe("fn_approve_expense", () => {
    it("approves a pending expense", async () => {
      const result = await supabase.rpc("fn_approve_expense", {
        p_caller_id: ownerUserId,
        p_expense_id: expenseId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });
  });

  describe("fn_reverse_expense", () => {
    it("reverses an approved expense", async () => {
      const result = await supabase.rpc("fn_reverse_expense", {
        p_caller_id: ownerUserId,
        p_expense_id: expenseId,
        p_reason: "Duplicate entry",
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });
  });
});
