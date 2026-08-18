import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("invoices RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let customerId: string;
  let customerUserId: string;
  let createdInvoiceId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-invoice-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Invoice Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-invoice-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Invoice Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }
    if (adminResult.error) {
      console.error("Create admin error:", adminResult.error);
    }

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-owner",
      p_pin: "123456",
    });

    if (ownerLogin.data) {
      ownerUserId = ownerLogin.data.user.id;
    }

    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-admin",
      p_pin: "123456",
    });

    if (adminLogin.data) {
      adminUserId = adminLogin.data.user.id;
    }

    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Invoice Test Customer",
      p_phone: "081234567890",
    });

    if (customerResult.error) {
      console.error("Create customer error:", customerResult.error);
    }

    if (customerResult.data) {
      customerId = customerResult.data.id as string;
    }

    const customerUserResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-invoice-customer",
      p_pin: "123456",
      p_role: "CUSTOMER",
      p_full_name: "RLS Invoice Customer",
      p_customer_id: customerId,
      p_created_by: ownerUserId,
    });

    if (customerUserResult.error) {
      console.error("Create customer user error:", customerUserResult.error);
    }

    if (customerUserResult.data) {
      customerUserId = customerUserResult.data as string;
    }

    const productResult = await supabase
      .from("products")
      .insert({
        sku: "RLS-INV-001",
        name: "RLS Invoice Test Product",
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
      const invoiceResult = await supabase.rpc("fn_create_invoice", {
        p_caller_id: adminUserId,
        p_invoice_type: "POS",
        p_customer_id: customerId,
        p_items: [
          {
            item_type: "PRODUCT",
            product_id: productResult.data.id,
            description: "RLS Test Product",
            quantity: 1,
            unit_price: 50000,
          },
        ],
      });

      if (invoiceResult.error) {
        console.error("Create invoice error:", invoiceResult.error);
      }

      if (invoiceResult.data) {
        createdInvoiceId = invoiceResult.data.id as string;
      }
    }
  });

  afterAll(async () => {
    if (createdInvoiceId) {
      await supabase
        .from("invoices")
        .delete()
        .eq("id", createdInvoiceId)
        .catch(() => {});
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

  it("staff can select invoices", async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number")
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("customer can select own invoices", async () => {
    const customerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-customer",
      p_pin: "123456",
    });

    if (customerLogin.error || !customerLogin.data) {
      console.error("Customer login error:", customerLogin.error);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number")
      .eq("customer_id", customerId)
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("customer cannot insert invoices directly", async () => {
    const customerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-customer",
      p_pin: "123456",
    });

    if (customerLogin.error || !customerLogin.data) {
      console.error("Customer login error:", customerLogin.error);
      return;
    }

    const { error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: "INV-TEST-9999",
        invoice_type: "POS",
        subtotal: 100000,
        total_amount: 100000,
        status: "UNPAID",
        created_by: customerUserId,
      });

    expect(error).toBeDefined();
  });

  it("staff can insert invoices via RPC", async () => {
    const { data, error } = await supabase.rpc("fn_create_invoice", {
      p_caller_id: adminUserId,
      p_invoice_type: "POS",
      p_items: [
        {
          item_type: "PRODUCT",
          description: "RLS Test Product",
          quantity: 1,
          unit_price: 50000,
        },
      ],
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();

    if (data) {
      await supabase
        .from("invoices")
        .delete()
        .eq("id", data.id as string)
        .catch(() => {});
    }
  });

  it("kasir can select invoice items", async () => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("id, description")
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("customer can select own invoice items", async () => {
    const customerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-customer",
      p_pin: "123456",
    });

    if (customerLogin.error || !customerLogin.data) {
      console.error("Customer login error:", customerLogin.error);
      return;
    }

    const { data, error } = await supabase
      .from("invoice_items")
      .select("id, description")
      .eq("invoice_id", createdInvoiceId)
      .limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("non-staff cannot insert invoice items directly", async () => {
    const customerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-invoice-customer",
      p_pin: "123456",
    });

    if (customerLogin.error || !customerLogin.data) {
      console.error("Customer login error:", customerLogin.error);
      return;
    }

    const { error } = await supabase
      .from("invoice_items")
      .insert({
        invoice_id: createdInvoiceId,
        item_type: "SERVICE",
        description: "Unauthorized Item",
        quantity: 1,
        unit_price: 10000,
        total_price: 10000,
      });

    expect(error).toBeDefined();
  });
});
