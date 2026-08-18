import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("users RLS policies", { timeout: 10000 }, () => {
  it("authenticated users can select users", async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can insert staff users", async () => {
    const { data, error } = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-test-user",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "RLS Test",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (error) {
      console.error("Create user error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("non-owner cannot insert OWNER role", async () => {
    const { error } = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-owner-test",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Owner Test",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");
  });

  it("duplicate username returns conflict", async () => {
    const { error } = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-test-user",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "RLS Test Duplicate",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("USERNAME_ALREADY_EXISTS");
  });
});
