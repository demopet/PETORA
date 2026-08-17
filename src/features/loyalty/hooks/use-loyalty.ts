import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { LoyaltyMember, LoyaltyTransaction } from '@/types/loyalty'

export function useLoyaltyMembers() {
  return useQuery({
    queryKey: ['loyalty-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_members')
        .select('*, loyalty_tiers(*)')
        .order('total_points', { ascending: false })

      if (error) throw error
      return data as (LoyaltyMember & { loyalty_tiers: any })[]
    },
  })
}

export function useLoyaltyMember(customerId: string) {
  return useQuery({
    queryKey: ['loyalty-members', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_members')
        .select('*, loyalty_tiers(*)')
        .eq('customer_id', customerId)
        .single()

      if (error) throw error
      return data as LoyaltyMember & { loyalty_tiers: any }
    },
    enabled: !!customerId,
  })
}

export function useLoyaltyTransactions(memberId: string) {
  return useQuery({
    queryKey: ['loyalty-transactions', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as LoyaltyTransaction[]
    },
    enabled: !!memberId,
  })
}

export function useEarnLoyaltyPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, points, invoiceId, description }: {
      memberId: string
      points: number
      invoiceId?: string
      description?: string
    }) => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .insert({
          member_id: memberId,
          transaction_type: 'EARN',
          points,
          invoice_id: invoiceId,
          description,
        })
        .select()
        .single()

      if (error) throw error
      return data as LoyaltyTransaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-members'] })
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] })
    },
  })
}

export function useRedeemLoyaltyPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, points, invoiceId }: {
      memberId: string
      points: number
      invoiceId?: string
    }) => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .insert({
          member_id: memberId,
          transaction_type: 'REDEEM',
          points: -points,
          invoice_id: invoiceId,
          description: 'Redeemed points',
        })
        .select()
        .single()

      if (error) throw error
      return data as LoyaltyTransaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-members'] })
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] })
    },
  })
}
