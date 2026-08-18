import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("customers RLS policies", { timeout: 10000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let customerId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-customer-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-customer-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }
    if (adminResult.error) {
      console.error("Create admin error:", adminResult.error);
    }

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-customer-owner",
      p_pin: "123456",
    });

    if (ownerLogin.data) {
      ownerUserId = ownerLogin.data.user.id;
    }

    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-customer-admin",
      p_pin: "123456",
    });

    if (adminLogin.data) {
      adminUserId = adminLogin.data.user.id;
    }
  });

  afterAll(async () => {
    if (customerId) {
      await supabase
        .rpc("fn_delete_customer", {
          p_caller_id: ownerUserId,
          p_customer_id: customerId,
        })
        .catch(() => {});
    }
  });

  it("authenticated users can select customers", async () => {
    const { data, error } = await supabase.from("customers").select("id, name");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can create customer via fn_create_customer", async () => {
    const { data, error } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Test Customer",
      p_phone: "081234567890",
    });

    if (error) {
      console.error("Create customer error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    customerId = data!.id as string;
  });

  it("admin can create customer via fn_create_customer", async () => {
    const { data, error } = await supabase.rpc("fn_create_customer", {
      p_caller_id: adminUserId,
      p_name: "RLS Admin Customer",
      p_phone: "089876543210",
    });

    if (error) {
      console.error("Create customer error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("non-staff cannot insert customer", async () => {
    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Customer for Non-Staff Test",
    });

    const customerIdForNonStaff = customerResult.data!.id as string;

    const nonStaffResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-customer-nonstaff",
      p_pin: "123456",
      p_role: "CUSTOMER",
      p_full_name: "Non Staff",
      p_customer_id: customerIdForNonStaff,
      p_created_by: ownerUserId,
    });

    if (nonStaffResult.error) {
      console.error("Create non-staff error:", nonStaffResult.error);
    }

    expect(nonStaffResult.error).toBeNull();

    const { error } = await supabase.rpc("fn_create_customer", {
      p_caller_id: nonStaffResult.data!,
      p_name: "Should Fail",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");

    await supabase
      .rpc("fn_delete_customer", {
        p_caller_id: ownerUserId,
        p_customer_id: customerIdForNonStaff,
      })
      .catch(() => {});
  });
});
