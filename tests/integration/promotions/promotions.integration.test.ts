import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("promotions integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let promotionId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "promo-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Promo Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "promo-test-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "Promo Test Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;
  });

  afterAll(async () => {
    if (promotionId) {
      await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId)
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

  describe("fn_create_promotion", () => {
    it("creates a promotion", async () => {
      const result = await supabase.rpc("fn_create_promotion", {
        p_caller_id: ownerUserId,
        p_code: "TESTPROMO",
        p_name: "Test Promotion",
        p_description: "Test description",
        p_promotion_type: "PERCENTAGE",
        p_discount_value: 20,
        p_min_purchase: 50000,
        p_max_usage: 100,
        p_start_date: "2026-01-01",
        p_end_date: "2026-12-31",
        p_applicable_products: null,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();

      if (result.data) {
        promotionId = result.data.id as string;
      }
    });

    it("throws FORBIDDEN for unauthorized caller", async () => {
      const kasirResult = await supabase.rpc("fn_auth_create_user", {
        p_username: "promo-test-kasir",
        p_pin: "123456",
        p_role: "KASIR",
        p_full_name: "Promo Test Kasir",
        p_created_by: ownerUserId,
      });

      if (kasirResult.data) {
        const result = await supabase.rpc("fn_create_promotion", {
          p_caller_id: kasirResult.data as string,
          p_code: "TESTPROMO2",
          p_name: "Test Promotion 2",
          p_promotion_type: "FIXED",
          p_discount_value: 10000,
          p_start_date: "2026-01-01",
          p_end_date: "2026-12-31",
        });

        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("42501");
      }
    });
  });

  describe("fn_validate_promo_code", () => {
    it("validates an active promotion", async () => {
      const result = await supabase.rpc("fn_validate_promo_code", {
        p_code: "TESTPROMO",
        p_subtotal: 100000,
        p_customer_id: null,
        p_items: null,
        p_caller_id: adminUserId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect((result.data as any).valid).toBe(true);
      expect((result.data as any).discount_amount).toBe(20000);
    });

    it("throws PROMO_NOT_FOUND for invalid code", async () => {
      const result = await supabase.rpc("fn_validate_promo_code", {
        p_code: "INVALIDCODE",
        p_subtotal: 100000,
        p_customer_id: null,
        p_items: null,
        p_caller_id: adminUserId,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("22000");
    });

    it("throws PROMOTION_INVALID for expired promotion", async () => {
      const expiredResult = await supabase.rpc("fn_create_promotion", {
        p_caller_id: ownerUserId,
        p_code: "EXPIREDPROMO",
        p_name: "Expired Promotion",
        p_promotion_type: "FIXED",
        p_discount_value: 5000,
        p_start_date: "2020-01-01",
        p_end_date: "2020-12-31",
      });

      if (expiredResult.data) {
        const result = await supabase.rpc("fn_validate_promo_code", {
          p_code: "EXPIREDPROMO",
          p_subtotal: 100000,
          p_customer_id: null,
          p_items: null,
          p_caller_id: adminUserId,
        });

        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("22000");
      }
    });
  });

  describe("fn_cancel_promotion", () => {
    it("cancels a promotion", async () => {
      const result = await supabase.rpc("fn_cancel_promotion", {
        p_caller_id: ownerUserId,
        p_promotion_id: promotionId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });
  });
});
