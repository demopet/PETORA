import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/user";

type UserSafe = Omit<User, "pin_hash">;

/**
 * Fetch all users.
 *
 * @returns Query result containing list of users (excluding PIN hashes)
 */
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

/**
 * Fetch a single user by ID.
 *
 * @param id - User UUID
 * @returns Query result containing the user
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
}

/**
 * Update an existing user.
 *
 * @returns Mutation function that accepts user ID and partial update input
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<User> }) => {
      const { data, error } = await supabase
        .from("users")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
