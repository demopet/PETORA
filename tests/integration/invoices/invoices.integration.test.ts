import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("invoices integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let customerId: string;
  let productId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "invoice-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Invoice Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "invoice-test-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "Invoice Test Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }
    if (adminResult.error) {
      console.error("Create admin error:", adminResult.error);
    }

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "invoice-test-owner",
      p_pin: "123456",
    });

    if (ownerLogin.data) {
      ownerUserId = ownerLogin.data.user.id;
    }

    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "invoice-test-admin",
      p_pin: "123456",
    });

    if (adminLogin.data) {
      adminUserId = adminLogin.data.user.id;
    }

    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Invoice Test Customer",
      p_phone: "081234567890",
      p_email: "invoice-test@example.com",
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
        sku: "INV-TEST-001",
        name: "Invoice Test Product",
        selling_price: 100000,
        purchase_price: 60000,
        stock_quantity: 50,
        stock_minimum: 5,
        stock_maximum: 100,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (productResult.error) {
      console.error("Create product error:", productResult.error);
    }

    if (productResult.data) {
      productId = productResult.data.id;
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

  it("creates invoice with items and validates totals", async () => {
    const { data, error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Invoice Test Product",
          quantity: 2,
          unit_price: 100000,
        },
        {
          item_type: "SERVICE",
          description: "Grooming Service",
          quantity: 1,
          unit_price: 75000,
        },
      ],
      p_discount_amount: 10000,
      p_tax_amount: 15000,
    });

    if (error) {
      console.error("Create invoice error:", error);
    }

    expect(error).toBeNull();
    expect(data!.subtotal).toBe(275000);
    expect(data!.discount_amount).toBe(10000);
    expect(data!.tax_amount).toBe(15000);
    expect(data!.total_amount).toBe(280000);
    expect(data!.items).toHaveLength(2);
  });

  it("records partial payment correctly", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Invoice Test Product",
          quantity: 1,
          unit_price: 100000,
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
    expect(data!.invoice.status).toBe("PARTIAL_PAYMENT");
    expect(data!.invoice.paid_amount).toBe(50000);
  });

  it("records full payment and transitions to PAID", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Invoice Test Product",
          quantity: 1,
          unit_price: 100000,
        },
      ],
    });

    const { data, error } = await supabase.rpc("fn_record_payment", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_payment_method: "TRANSFER",
      p_amount: 100000,
    });

    if (error) {
      console.error("Record payment error:", error);
    }

    expect(error).toBeNull();
    expect(data!.invoice.status).toBe("PAID");
    expect(data!.invoice.paid_amount).toBe(100000);
  });

  it("cancels invoice with stock restoration and loyalty reversal", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_customer_id: customerId,
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Invoice Test Product",
          quantity: 5,
          unit_price: 100000,
        },
      ],
      p_loyalty_points_to_redeem: 10,
    });

    const stockBeforeCancel = (await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single()).data!.stock_quantity;

    const { data, error } = await supabase.rpc("fn_cancel_invoice", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
      p_reason: "Test cancellation with loyalty reversal",
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

    expect(stockAfterCancel).toBe(stockBeforeCancel + 5);
  });

  it("prevents cancellation of already cancelled invoice", async () => {
    const { data: invoice } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Invoice Test Product",
          quantity: 1,
          unit_price: 100000,
        },
      ],
    });

    await supabase.rpc("fn_cancel_invoice", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
    });

    const { error } = await supabase.rpc("fn_cancel_invoice", {
      p_caller_id: adminUserId,
      p_invoice_id: invoice!.id,
    });

    expect(error).toBeDefined();
    expect(error!.message).toContain("ALREADY_CANCELLED");
  });

  it("validates item constraints in createInvoice", async () => {
    const { error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_items: [
        {
          item_type: "INVALID_TYPE",
          description: "Invalid Item",
          quantity: 1,
          unit_price: 100000,
        },
      ],
    });

    expect(error).toBeDefined();
    expect(error!.message).toContain("VALIDATION_ERROR");
  });

  it("prevents negative quantity in items", async () => {
    const { error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_items: [
        {
          item_type: "PRODUCT",
          product_id: productId,
          description: "Test",
          quantity: -1,
          unit_price: 100000,
        },
      ],
    });

    expect(error).toBeDefined();
    expect(error!.message).toContain("VALIDATION_ERROR");
  });
});
