import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Promotion, CreatePromotionInput } from '@/types/promotion'

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      return data as Promotion[]
    },
  })
}

export function usePromotion(id: string) {
  return useQuery({
    queryKey: ['promotions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Promotion
    },
    enabled: !!id,
  })
}

export function useCreatePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePromotionInput) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          ...input,
          status: 'ACTIVE',
          current_usage: 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as Promotion
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreatePromotionInput> }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Promotion
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}

export function useArchivePromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .update({ status: 'EXPIRED' })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    },
  })
}
