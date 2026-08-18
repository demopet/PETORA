import { supabase } from "@/lib/supabase/client";
import { loginCredentialsSchema, updatePinSchema } from "@/schemas/user";
import type {
  LoginCredentials,
  LoginResponse,
  CreateUserInput,
} from "@/types/user";

function mapAuthError(error: {
  message?: string;
  code?: string;
  details?: string;
}): Error {
  const message = error.message || "Unknown error";

  if (message.includes("INVALID_OLD_PIN")) {
    return new Error("INVALID_OLD_PIN");
  }
  if (message.includes("INVALID_CREDENTIALS") || error.code === "28P01") {
    return new Error("INVALID_CREDENTIALS");
  }
  if (message.includes("ACCOUNT_LOCKED")) {
    return new Error(message);
  }
  if (message.includes("ACCOUNT_INACTIVE")) {
    return new Error("ACCOUNT_INACTIVE");
  }
  if (message.includes("USERNAME_ALREADY_EXISTS") || error.code === "23505") {
    return new Error("USERNAME_ALREADY_EXISTS");
  }
  if (message.includes("FORBIDDEN") || error.code === "42501") {
    return new Error("FORBIDDEN");
  }
  if (message.includes("BAD_REQUEST") || error.code === "22000") {
    return new Error("BAD_REQUEST");
  }

  return new Error(message);
}

/**
 * Authenticate a user with username and PIN.
 *
 * @param credentials - Login credentials containing username and 6-digit PIN
 * @returns Login response with user data and session token
 * @throws {Error} INVALID_CREDENTIALS when username/PIN is incorrect
 * @throws {Error} ACCOUNT_LOCKED when account is locked due to failed attempts
 * @throws {Error} ACCOUNT_INACTIVE when account is deactivated
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const parsed = loginCredentialsSchema.parse(credentials);

  const { data, error } = await supabase.rpc("fn_auth_login", {
    p_username: parsed.username,
    p_pin: parsed.pin,
  });

  if (error) {
    throw mapAuthError(error);
  }

  return data as LoginResponse;
}

/**
 * Invalidate the current session.
 *
 * @param sessionToken - Active session token to invalidate
 * @throws {Error} When logout fails
 */
export async function logout(sessionToken: string): Promise<void> {
  const { error } = await supabase.rpc("fn_auth_logout", {
    p_session_token: sessionToken,
  });

  if (error) {
    throw mapAuthError(error);
  }
}

/**
 * Change the current user's PIN.
 *
 * @param userId - ID of the user changing their PIN
 * @param oldPin - Current 6-digit PIN
 * @param newPin - New 6-digit PIN
 * @throws {Error} INVALID_OLD_PIN when current PIN is incorrect
 */
export async function changePin(
  userId: string,
  oldPin: string,
  newPin: string,
): Promise<void> {
  const parsed = updatePinSchema.parse({ old_pin: oldPin, new_pin: newPin });

  const { error } = await supabase.rpc("fn_auth_change_pin", {
    p_user_id: userId,
    p_old_pin: parsed.old_pin,
    p_new_pin: parsed.new_pin,
  });

  if (error) {
    throw mapAuthError(error);
  }
}

/**
 * Reset a user's PIN (admin/owner only).
 *
 * @param callerUserId - ID of the admin/owner performing the reset
 * @param targetUserId - ID of the user whose PIN is being reset
 * @param newPin - New 6-digit PIN
 * @throws {Error} VALIDATION_ERROR when new PIN format is invalid
 * @throws {Error} FORBIDDEN when caller lacks permission
 */
export async function resetPin(
  callerUserId: string,
  targetUserId: string,
  newPin: string,
): Promise<void> {
  if (!/^\d{6}$/.test(newPin)) {
    throw new Error("VALIDATION_ERROR");
  }

  const { error } = await supabase.rpc("fn_auth_reset_pin", {
    p_caller_id: callerUserId,
    p_target_user_id: targetUserId,
    p_new_pin: newPin,
  });

  if (error) {
    throw mapAuthError(error);
  }
}

/**
 * Create a new user account.
 *
 * @param input - User creation data including username, PIN, role, and full name
 * @param callerUserId - ID of the user creating the account (for audit)
 * @throws {Error} USERNAME_ALREADY_EXISTS when username is taken
 * @throws {Error} FORBIDDEN when caller lacks permission
 */
export async function createUser(
  input: CreateUserInput,
  callerUserId: string,
): Promise<void> {
  const parsed = loginCredentialsSchema.parse({
    username: input.username,
    pin: input.pin,
  });

  const { error } = await supabase.rpc("fn_auth_create_user", {
    p_username: parsed.username,
    p_pin: parsed.pin,
    p_role: input.role,
    p_full_name: input.full_name,
    p_customer_id: input.customer_id ?? null,
    p_created_by: callerUserId,
  });

  if (error) {
    throw mapAuthError(error);
  }
}
