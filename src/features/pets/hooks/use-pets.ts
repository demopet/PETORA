import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Pet, CreatePetInput, UpdatePetInput } from '@/types/pet'

export function usePets(customerId?: string) {
  return useQuery({
    queryKey: ['pets', customerId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('pets')
        .select('*')
        .is('deleted_at', null)

      if (customerId) {
        query = query.eq('customer_id', customerId)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return data as Pet[]
    },
  })
}

export function usePet(id: string) {
  return useQuery({
    queryKey: ['pets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Pet
    },
    enabled: !!id,
  })
}

export function useCreatePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePetInput) => {
      const { data, error } = await supabase
        .from('pets')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as Pet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

export function useUpdatePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePetInput }) => {
      const { data, error } = await supabase
        .from('pets')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Pet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

export function useDeletePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}
