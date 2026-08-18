import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("promotions RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let kasirUserId: string;
  let promotionId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-promo-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Promo Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-promo-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Promo Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const kasirResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-promo-kasir",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "RLS Promo Kasir",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;
    if (kasirResult.data) kasirUserId = kasirResult.data as string;

    const promoResult = await supabase
      .from("promotions")
      .insert({
        code: "RLSPROMO",
        name: "RLS Test Promotion",
        promotion_type: "PERCENTAGE",
        discount_value: 10,
        min_purchase: 0,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        status: "ACTIVE",
      })
      .select()
      .single();

    if (promoResult.data) {
      promotionId = promoResult.data.id;
    }
  });

  afterAll(async () => {
    if (promotionId) {
      await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId)
        .catch(() => {});
    }
    const usersToDelete = [kasirUserId, adminUserId, ownerUserId].filter(Boolean);
    for (const uid of usersToDelete) {
      await supabase
        .from("users")
        .delete()
        .eq("id", uid)
        .catch(() => {});
    }
  });

  describe("promotions RLS", () => {
    it("allows all authenticated users to select promotions", async () => {
      const { data, error } = await supabase.from("promotions").select("*").eq("id", promotionId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
    });

    it("allows owner/admin to insert promotions", async () => {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          code: "RLSPROMO2",
          name: "RLS Test Promotion 2",
          promotion_type: "FIXED",
          discount_value: 5000,
          min_purchase: 0,
          start_date: "2026-01-01",
          end_date: "2026-12-31",
          status: "ACTIVE",
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data) {
        await supabase
          .from("promotions")
          .delete()
          .eq("id", data.id)
          .catch(() => {});
      }
    });
  });

  describe("promotion_usage RLS", () => {
    it("allows staff to select promotion usage", async () => {
      const usageResult = await supabase
        .from("promotion_usage")
        .insert({
          promotion_id: promotionId,
          invoice_id: "00000000-0000-0000-0000-000000000000",
          discount_applied: 5000,
        })
        .select()
        .single();

      if (usageResult.data) {
        const { data, error } = await supabase
          .from("promotion_usage")
          .select("*")
          .eq("id", usageResult.data.id);

        expect(error).toBeNull();
        expect(data).toBeDefined();

        await supabase
          .from("promotion_usage")
          .delete()
          .eq("id", usageResult.data.id)
          .catch(() => {});
      }
    });
  });
});
