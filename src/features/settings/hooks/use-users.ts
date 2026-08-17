import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@/types/user'

type UserSafe = Omit<User, 'pin_hash'>

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, full_name, customer_id, created_by, failed_login_attempts, locked_until, is_active, last_login_at, created_at, updated_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as UserSafe[]
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { username: string; pin: string; role: string; full_name: string; customer_id?: string }) => {
      const { data, error } = await supabase.functions.invoke('auth-create-user', { body: input })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('auth-deactivate-user', { body: { target_user_id: userId } })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useResetPin() {
  return useMutation({
    mutationFn: async ({ userId, newPin }: { userId: string; newPin: string }) => {
      const { error } = await supabase.functions.invoke('auth-reset-pin', { body: { target_user_id: userId, new_pin: newPin } })
      if (error) throw new Error(error.message)
    },
  })
}
