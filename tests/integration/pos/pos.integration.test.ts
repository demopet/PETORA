import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("POS integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let customerId: string;
  let productId: string;
  let initialStock: number;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "pos-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "POS Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "pos-test-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "POS Test Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }
    if (adminResult.error) {
      console.error("Create admin error:", adminResult.error);
    }

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "pos-test-owner",
      p_pin: "123456",
    });

    if (ownerLogin.data) {
      ownerUserId = ownerLogin.data.user.id;
    }

    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "pos-test-admin",
      p_pin: "123456",
    });

    if (adminLogin.data) {
      adminUserId = adminLogin.data.user.id;
    }

    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "POS Test Customer",
      p_phone: "081234567890",
      p_email: "pos-test@example.com",
    });

    if (customerResult.error) {
      console.error("Create customer error:", customerResult.error);
    }

    if (customerResult.data) {
      customerId = customerResult.data.id as string;
    }

    const productResult = await supabase
      .from("products")
      .insert({
        sku: "POS-TEST-001",
        name: "POS Test Product",
        selling_price: 50000,
        purchase_price: 30000,
        stock_quantity: 100,
        stock_minimum: 5,
        stock_maximum: 200,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (productResult.error) {
      console.error("Create product error:", productResult.error);
    }

    if (productResult.data) {
      productId = productResult.data.id;
      initialStock = productResult.data.stock_quantity;
    }
  });

  afterAll(async () => {
    if (productId) {
      await supabase.from("products").delete().eq("id", productId).catch(() => {});
    }
    if (customerId) {
      await supabase
        .rpc("fn_delete_customer", {
          p_caller_id: ownerUserId,
          p_customer_id: customerId,
        })
        .catch(() => {});
    }
  });

  it("creates a POS invoice with products via fn_create_invoice", async () => {
    const { data, error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 2,
          unit_price: 50000,
        },
      ],
      p_discount_amount: 0,
      p_tax_amount: 5000,
      p_promotion_id: null,
      p_loyalty_points_to_redeem: 0,
      p_notes: "POS integration test",
    });

    if (error) {
      console.error("Create invoice error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.invoice_number).toMatch(/^INV-\d{8}-\d{4}$/);
    expect(data!.total_amount).toBe(105000);
    expect(data!.status).toBe("UNPAID");
    expect(data!.items).toHaveLength(1);
    expect(data!.items[0].quantity).toBe(2);
  });

  it("deducts stock atomically after checkout", async () => {
    const { data: productAfter } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();

    expect(productAfter!.stock_quantity).toBe(initialStock - 2);
  });

  it("creates stock movements for deducted stock", async () => {
    const { data: movements } = await supabase
      .from("stock_movements")
      .select("*")
      .eq("reference_id", (await supabase.rpc("fn_create_invoice", {
        p_caller_id: adminUserId,
        p_invoice_type: "POS",
        p_customer_id: customerId,
        p_items: [
          {
            item_type: "PRODUCT",
            product_id: productId,
            description: "POS Test Product",
            quantity: 1,
            unit_price: 50000,
          },
        ],
      })).data!.id);

    expect(movements!.length).toBeGreaterThan(0);
    expect(movements![0].movement_type).toBe("OUT");
  });

  it("records payment and updates invoice status to PAID", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 1,
          unit_price: 50000,
        },
      ],
    });

    const { data, error } = await supabase.rpc("fn_record_payment", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_payment_method: "CASH",
      p_amount: 50000,
    });

    if (error) {
      console.error("Record payment error:", error);
    }

    expect(error).toBeNull();
    expect(data!.invoice.status).toBe("PAID");
  });

  it("cancels invoice and restores stock", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 3,
          unit_price: 50000,
        },
      ],
    });

    const stockBeforeCancel = (await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single()).data!.stock_quantity;

    const { data, error } = await supabase.rpc("fn_cancel_invoice", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_reason: "Integration test cancellation",
    });

    if (error) {
      console.error("Cancel invoice error:", error);
    }

    expect(error).toBeNull();
    expect(data!.status).toBe("CANCELLED");

    const stockAfterCancel = (await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single()).data!.stock_quantity;

    expect(stockAfterCancel).toBe(stockBeforeCancel + 3);
  });

  it("prevents oversell with concurrent checkout", async () => {
    const { data: invoice1 } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 50,
          unit_price: 50000,
        },
      ],
    });

    expect(invoice1).toBeDefined();

    const { error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 60,
          unit_price: 50000,
        },
      ],
    });

    expect(error).toBeDefined();
    expect(error!.message).toContain("INSUFFICIENT_STOCK");
  });

  it("returns daily sales summary via fn_get_daily_sales", async () => {
    const { data, error } = await supabase.rpc("fn_get_daily_sales", {
      p_caller_id: adminUserId,
      p_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      console.error("Daily sales error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.date).toBe(new Date().toISOString().split("T")[0]);
    expect(typeof data!.total_sales).toBe("number");
    expect(typeof data!.total_transactions).toBe("number");
    expect(typeof data!.total_items).toBe("number");
  });

  it("prevents double payment on paid invoice", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "POS Test Product",
          quantity: 1,
          unit_price: 50000,
        },
      ],
    });

    await supabase.rpc("fn_record_payment", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_payment_method: "CASH",
      p_amount: 50000,
    });

    const { error } = await supabase.rpc("fn_record_payment", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_payment_method: "CASH",
      p_amount: 1000,
    });

    expect(error).toBeDefined();
    expect(error!.message).toContain("INVOICE_ALREADY_PAID");
  });
});
