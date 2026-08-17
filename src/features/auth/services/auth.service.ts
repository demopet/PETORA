import { supabase } from '@/lib/supabase/client'
import { loginCredentialsSchema, updatePinSchema } from '@/schemas/user'
import type { LoginCredentials, LoginResponse, CreateUserInput } from '@/types/user'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const parsed = loginCredentialsSchema.parse(credentials);

  const { data, error } = await supabase.functions.invoke('auth-login', {
    body: parsed,
  });

  if (error) {
    throw new Error(error.message || 'Login failed');
  }

  return data as LoginResponse;
}

export async function logout(sessionToken: string): Promise<void> {
  const { error } = await supabase.functions.invoke('auth-logout', {
    body: { token: sessionToken },
  });

  if (error) {
    throw new Error(error.message || 'Logout failed');
  }
}

export async function changePin(oldPin: string, newPin: string): Promise<void> {
  const parsed = updatePinSchema.parse({ old_pin: oldPin, new_pin: newPin });

  const { error } = await supabase.functions.invoke('auth-change-pin', {
    body: parsed,
  });

  if (error) {
    throw new Error(error.message || 'Failed to change PIN');
  }
}

export async function resetPin(targetUserId: string, newPin: string): Promise<void> {
  const { error } = await supabase.functions.invoke('auth-reset-pin', {
    body: { target_user_id: targetUserId, new_pin: newPin },
  });

  if (error) {
    throw new Error(error.message || 'Failed to reset PIN');
  }
}

export async function createUser(input: CreateUserInput, callerUserId: string): Promise<void> {
  const parsed = loginCredentialsSchema.parse({
    username: input.username,
    pin: input.pin,
  });

  const { error } = await supabase.functions.invoke('auth-create-user', {
    body: {
      ...parsed,
      role: input.role,
      full_name: input.full_name,
      customer_id: input.customer_id,
      caller_user_id: callerUserId,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create user');
  }
}
