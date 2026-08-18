import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("customers integration", { timeout: 10000 }, () => {
  let createdCustomerId: string;
  let createdUserId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "crm-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "CRM Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "crm-test-owner",
      p_pin: "123456",
    });

    if (ownerData) {
      createdUserId = ownerData.user.id;
    }
  });

  afterAll(async () => {
    if (createdCustomerId) {
      await supabase
        .rpc("fn_delete_customer", {
          p_caller_id: createdUserId,
          p_customer_id: createdCustomerId,
        })
        .catch(() => {});
    }
  });

  it("creates a customer via fn_create_customer", async () => {
    const { data, error } = await supabase.rpc("fn_create_customer", {
      p_caller_id: createdUserId,
      p_name: "Integration Test Customer",
      p_phone: "081234567890",
      p_email: "integration@test.com",
      p_address: "Test Address",
      p_is_guest: true,
      p_tags: ["NEW"],
    });

    if (error) {
      console.error("Create customer error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.id).toBeDefined();
    createdCustomerId = data!.id as string;
  });

  it("retrieves the created customer", async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", createdCustomerId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.name).toBe("Integration Test Customer");
    expect(data!.is_guest).toBe(true);
    expect(data!.tags).toEqual(["NEW"]);
  });

  it("updates the customer via fn_update_customer", async () => {
    const { error } = await supabase.rpc("fn_update_customer", {
      p_caller_id: createdUserId,
      p_customer_id: createdCustomerId,
      p_name: "Updated Customer Name",
      p_phone: "089876543210",
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", createdCustomerId)
      .single();

    expect(data!.name).toBe("Updated Customer Name");
    expect(data!.phone).toBe("089876543210");
  });

  it("converts guest to registered via fn_convert_guest", async () => {
    const { data, error } = await supabase.rpc("fn_convert_guest", {
      p_caller_id: createdUserId,
      p_customer_id: createdCustomerId,
      p_username: "converted-guest",
      p_pin: "654321",
    });

    if (error) {
      console.error("Convert guest error:", error);
    }

    expect(error).toBeNull();
    expect(data!.is_guest).toBe(false);

    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", createdCustomerId)
      .single();

    expect(customer!.is_guest).toBe(false);

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("customer_id", createdCustomerId)
      .single();

    expect(user).toBeDefined();
    expect(user!.username).toBe("converted-guest");
  });

  it("soft deletes the customer via fn_delete_customer", async () => {
    const { error } = await supabase.rpc("fn_delete_customer", {
      p_caller_id: createdUserId,
      p_customer_id: createdCustomerId,
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", createdCustomerId)
      .single();

    expect(data).toBeNull();
  });
});
