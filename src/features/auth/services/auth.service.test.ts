import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, logout, changePin, resetPin, createUser } from "./auth.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("returns user and session token on success", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        role: "ADMIN",
        full_name: "Test User",
        customer_id: null,
        created_by: null,
        failed_login_attempts: 0,
        locked_until: null,
        is_active: true,
        last_login_at: "2026-08-18T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-08-18T00:00:00Z",
      };
      const mockResponse = {
        user: mockUser,
        session_token: "abc123",
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      const result = await login({ username: "testuser", pin: "123456" });
      expect(result).toEqual(mockResponse);
      expect(supabase.rpc).toHaveBeenCalledWith("fn_auth_login", {
        p_username: "testuser",
        p_pin: "123456",
      });
    });

    it("throws INVALID_CREDENTIALS on wrong PIN", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "INVALID_CREDENTIALS", code: "28P01" },
      } as any);

      await expect(
        login({ username: "testuser", pin: "000000" }),
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("throws ACCOUNT_LOCKED when account is locked", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "ACCOUNT_LOCKED|locked_until:2026-08-18T01:00:00Z" },
      } as any);

      await expect(
        login({ username: "testuser", pin: "123456" }),
      ).rejects.toThrow("ACCOUNT_LOCKED");
    });

    it("throws ACCOUNT_INACTIVE when account is deactivated", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "ACCOUNT_INACTIVE" },
      } as any);

      await expect(
        login({ username: "testuser", pin: "123456" }),
      ).rejects.toThrow("ACCOUNT_INACTIVE");
    });
  });

  describe("logout", () => {
    it("calls fn_auth_logout with session token", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await logout("token-123");
      expect(supabase.rpc).toHaveBeenCalledWith("fn_auth_logout", {
        p_session_token: "token-123",
      });
    });
  });

  describe("changePin", () => {
    it("calls fn_auth_change_pin with correct params", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await changePin("user-1", "123456", "654321");
      expect(supabase.rpc).toHaveBeenCalledWith("fn_auth_change_pin", {
        p_user_id: "user-1",
        p_old_pin: "123456",
        p_new_pin: "654321",
      });
    });

    it("throws INVALID_OLD_PIN on wrong old PIN", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "INVALID_OLD_PIN", code: "28P01" },
      } as any);

      await expect(changePin("user-1", "000000", "654321")).rejects.toThrow(
        "INVALID_OLD_PIN",
      );
    });
  });

  describe("resetPin", () => {
    it("calls fn_auth_reset_pin with correct params", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await resetPin("caller-1", "target-1", "123456");
      expect(supabase.rpc).toHaveBeenCalledWith("fn_auth_reset_pin", {
        p_caller_id: "caller-1",
        p_target_user_id: "target-1",
        p_new_pin: "123456",
      });
    });

    it("throws FORBIDDEN when caller lacks permission", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(resetPin("admin-1", "owner-1", "123456")).rejects.toThrow(
        "FORBIDDEN",
      );
    });
  });

  describe("createUser", () => {
    it("calls fn_auth_create_user with correct params", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { id: "new-user-id" },
        error: null,
      } as any);

      await createUser(
        {
          username: "newuser",
          pin: "123456",
          role: "ADMIN",
          full_name: "New User",
        },
        "caller-1",
      );

      expect(supabase.rpc).toHaveBeenCalledWith("fn_auth_create_user", {
        p_username: "newuser",
        p_pin: "123456",
        p_role: "ADMIN",
        p_full_name: "New User",
        p_customer_id: null,
        p_created_by: "caller-1",
      });
    });

    it("throws USERNAME_ALREADY_EXISTS on duplicate username", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "USERNAME_ALREADY_EXISTS", code: "23505" },
      } as any);

      await expect(
        createUser(
          {
            username: "existing",
            pin: "123456",
            role: "ADMIN",
            full_name: "Existing",
          },
          "caller-1",
        ),
      ).rejects.toThrow("USERNAME_ALREADY_EXISTS");
    });
  });
});
