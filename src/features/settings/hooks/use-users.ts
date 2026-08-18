import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/user";

type UserSafe = Omit<User, "pin_hash">;

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, username, role, full_name, customer_id, created_by, failed_login_attempts, locked_until, is_active, last_login_at, created_at, updated_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserSafe[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      username: string;
      pin: string;
      role: string;
      full_name: string;
      customer_id?: string;
      caller_user_id?: string;
    }) => {
      const { error } = await supabase.rpc("fn_auth_create_user", {
        p_username: input.username,
        p_pin: input.pin,
        p_role: input.role,
        p_full_name: input.full_name,
        p_customer_id: input.customer_id ?? null,
        p_created_by: input.caller_user_id ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      callerUserId,
    }: {
      userId: string;
      callerUserId?: string;
    }) => {
      const { error } = await supabase.rpc("fn_auth_deactivate_user", {
        p_caller_id: callerUserId ?? null,
        p_target_user_id: userId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useResetPin() {
  return useMutation({
    mutationFn: async ({
      userId,
      newPin,
      callerUserId,
    }: {
      userId: string;
      newPin: string;
      callerUserId?: string;
    }) => {
      const { error } = await supabase.rpc("fn_auth_reset_pin", {
        p_caller_id: callerUserId ?? null,
        p_target_user_id: userId,
        p_new_pin: newPin,
      });
      if (error) throw new Error(error.message);
    },
  });
}
