import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("loyalty integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let kasirUserId: string;
  let customerId: string;
  let memberId: string;
  let tierId: string;
  let invoiceId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "loyalty-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Loyalty Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "loyalty-test-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "Loyalty Test Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const kasirResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "loyalty-test-kasir",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "Loyalty Test Kasir",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;
    if (kasirResult.data) kasirUserId = kasirResult.data as string;

    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Loyalty Test Customer",
      p_phone: "081234567890",
      p_email: "loyalty-test@example.com",
    });

    if (customerResult.data) {
      customerId = customerResult.data.id as string;
    }

    const tierResult = await supabase
      .from("loyalty_tiers")
      .insert({
        tier_name: "BRONZE",
        min_points: 0,
        min_spending: 0,
        point_multiplier: 1.0,
        benefits: {},
      })
      .select()
      .single();

    if (tierResult.data) {
      tierId = tierResult.data.id;
    }

    const memberResult = await supabase
      .from("loyalty_members")
      .insert({
        customer_id: customerId,
        tier_id: tierId,
        total_points: 0,
        available_points: 0,
        total_spending: 0,
      })
      .select()
      .single();

    if (memberResult.data) {
      memberId = memberResult.data.id;
    }

    const productResult = await supabase
      .from("products")
      .insert({
        sku: "LOY-TEST-001",
        name: "Loyalty Test Product",
        selling_price: 50000,
        purchase_price: 30000,
        stock_quantity: 100,
        stock_minimum: 5,
        stock_maximum: 200,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (productResult.data) {
      const productId = productResult.data.id;

      const invoiceResult = await supabase
        .from("invoices")
        .insert({
          invoice_number: "INV-LOYALTY-TEST-001",
          invoice_type: "POS",
          customer_id: customerId,
          subtotal: 150000,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: 150000,
          paid_amount: 150000,
          status: "PAID",
          notes: "Loyalty test invoice",
          created_by: kasirUserId,
        })
        .select()
        .single();

      if (invoiceResult.data) {
        invoiceId = invoiceResult.data.id;

        await supabase.from("invoice_items").insert({
          invoice_id: invoiceId,
          item_type: "PRODUCT",
          product_id: productId,
          description: "Loyalty Test Product",
          quantity: 3,
          unit_price: 50000,
          total_price: 150000,
        });
      }
    }
  });

  afterAll(async () => {
    if (invoiceId) {
      await supabase
        .from("payments")
        .delete()
        .eq("invoice_id", invoiceId)
        .catch(() => {});
      await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId)
        .catch(() => {});
      await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId)
        .catch(() => {});
    }
    if (memberId) {
      await supabase
        .from("loyalty_transactions")
        .delete()
        .eq("member_id", memberId)
        .catch(() => {});
      await supabase
        .from("loyalty_members")
        .delete()
        .eq("id", memberId)
        .catch(() => {});
    }
    if (tierId) {
      await supabase
        .from("loyalty_tiers")
        .delete()
        .eq("id", tierId)
        .catch(() => {});
    }
    if (customerId) {
      await supabase
        .from("customers")
        .delete()
        .eq("id", customerId)
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

  describe("fn_earn_loyalty_points", () => {
    it("earns points for a paid invoice", async () => {
      const result = await supabase.rpc("fn_earn_loyalty_points", {
        p_customer_id: customerId,
        p_invoice_id: invoiceId,
        p_total_amount: 150000,
        p_caller_id: kasirUserId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect((result.data as any).points).toBe(15);
      expect((result.data as any).member_id).toBe(memberId);
    });

    it("throws FORBIDDEN for unauthorized caller", async () => {
      const customerResult = await supabase.rpc("fn_auth_create_user", {
        p_username: "loyalty-test-customer-user",
        p_pin: "123456",
        p_role: "CUSTOMER",
        p_full_name: "Loyalty Test Customer User",
        p_customer_id: customerId,
        p_created_by: ownerUserId,
      });

      if (customerResult.data) {
        const result = await supabase.rpc("fn_earn_loyalty_points", {
          p_customer_id: customerId,
          p_invoice_id: invoiceId,
          p_total_amount: 150000,
          p_caller_id: customerResult.data as string,
        });

        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("42501");
      }
    });
  });

  describe("fn_redeem_loyalty_points", () => {
    it("redeems points successfully", async () => {
      const result = await supabase.rpc("fn_redeem_loyalty_points", {
        p_customer_id: customerId,
        p_points_to_redeem: 5,
        p_invoice_id: invoiceId,
        p_caller_id: kasirUserId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect((result.data as any).discount_value).toBe(500);
    });

    it("throws INSUFFICIENT_POINTS when redeeming more than available", async () => {
      const result = await supabase.rpc("fn_redeem_loyalty_points", {
        p_customer_id: customerId,
        p_points_to_redeem: 999999,
        p_invoice_id: invoiceId,
        p_caller_id: kasirUserId,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("22000");
    });
  });

  describe("fn_check_tier_upgrade", () => {
    it("does not upgrade when not qualified", async () => {
      const memberResult = await supabase
        .from("loyalty_members")
        .select("id")
        .eq("customer_id", customerId)
        .single();

      if (memberResult.data) {
        const result = await supabase.rpc("fn_check_tier_upgrade", {
          p_member_id: memberResult.data.id,
          p_caller_id: ownerUserId,
        });

        expect(result.error).toBeNull();
        expect((result.data as any).upgraded).toBe(false);
      }
    });
  });
});
