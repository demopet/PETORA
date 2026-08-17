import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { StockMovement, CreateStockMovementInput } from '@/types/product'

export function useStockMovements(productId?: string) {
  return useQuery({
    queryKey: ['stock-movements', productId],
    queryFn: async () => {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })

      if (productId) {
        query = query.eq('product_id', productId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as StockMovement[]
    },
    enabled: !!productId,
  })
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateStockMovementInput) => {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as StockMovement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
    },
  })
}
