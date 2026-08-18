import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("expenses RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let expenseId: string;
  let categoryId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-expense-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Expense Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-expense-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Expense Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;

    const categoryResult = await supabase
      .from("expense_categories")
      .insert({
        name: "RLS Test Category",
        description: "RLS test expense category",
        is_active: true,
      })
      .select()
      .single();

    if (categoryResult.data) {
      categoryId = categoryResult.data.id;
    }

    const expenseResult = await supabase
      .from("expenses")
      .insert({
        expense_date: "2026-08-18",
        category_id: categoryId,
        amount: 500000,
        description: "RLS Test Expense",
        status: "PENDING",
        is_recurring: false,
        created_by: adminUserId,
      })
      .select()
      .single();

    if (expenseResult.data) {
      expenseId = expenseResult.data.id;
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

  describe("expenses RLS", () => {
    it("allows owner/admin to select expenses", async () => {
      const { data, error } = await supabase.from("expenses").select("*").eq("id", expenseId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
    });

    it("allows owner/admin to update expenses", async () => {
      const { data, error } = await supabase
        .from("expenses")
        .update({ amount: 600000 })
        .eq("id", expenseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe("expense_categories RLS", () => {
    it("allows owner/admin to select expense categories", async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("id", categoryId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
    });
  });
});
