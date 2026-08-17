import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { CashShift } from '@/types/invoice'

export function useCashShifts() {
  return useQuery({
    queryKey: ['cash-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_shifts')
        .select('*')
        .order('open_time', { ascending: false })

      if (error) throw error
      return data as CashShift[]
    },
  })
}

export function useCurrentCashShift() {
  return useQuery({
    queryKey: ['cash-shifts', 'current'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_shifts')
        .select('*')
        .is('close_time', null)
        .maybeSingle()

      if (error) throw error
      return data as CashShift | null
    },
  })
}

export function useOpenCashShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (openingCash: number) => {
      const { data, error } = await supabase
        .from('cash_shifts')
        .insert({
          open_time: new Date().toISOString(),
          opening_cash: openingCash,
        })
        .select()
        .single()

      if (error) throw error
      return data as CashShift
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-shifts'] })
    },
  })
}

export function useCloseCashShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, closingCash }: { id: string; closingCash: number }) => {
      const { data: shift } = await supabase
        .from('cash_shifts')
        .select('opening_cash')
        .eq('id', id)
        .single()

      const difference = closingCash - (shift?.opening_cash || 0)

      const { data, error } = await supabase
        .from('cash_shifts')
        .update({
          close_time: new Date().toISOString(),
          closing_cash: closingCash,
          difference,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CashShift
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-shifts'] })
    },
  })
}
