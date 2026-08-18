import { describe, it, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("auth integration", { timeout: 10000 }, () => {
  afterAll(async () => {
    await supabase.auth.signOut();
  });

  it("login succeeds with valid credentials", async () => {
    const { data, error } = await supabase.rpc("fn_auth_login", {
      p_username: "testuser",
      p_pin: "123456",
    });

    if (error) {
      console.error("Login error:", error);
    }

    expect(error).toBeNull();
    expect(data).toHaveProperty("user");
    expect(data).toHaveProperty("session_token");
    expect(data.user.username).toBe("testuser");
  });

  it("login fails with invalid PIN", async () => {
    const { error } = await supabase.rpc("fn_auth_login", {
      p_username: "testuser",
      p_pin: "000000",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("INVALID_CREDENTIALS");
  });

  it("login fails for non-existent user", async () => {
    const { error } = await supabase.rpc("fn_auth_login", {
      p_username: "nonexistent",
      p_pin: "123456",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("INVALID_CREDENTIALS");
  });

  it("logout succeeds with valid session token", async () => {
    const loginResult = await supabase.rpc("fn_auth_login", {
      p_username: "testuser",
      p_pin: "123456",
    });

    const { error } = await supabase.rpc("fn_auth_logout", {
      p_session_token: loginResult.data!.session_token,
    });

    expect(error).toBeNull();
  });
});
