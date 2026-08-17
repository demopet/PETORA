import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { MedicalRecord, CreateMedicalRecordInput } from '@/types/medical-record'

export function useMedicalRecords() {
  return useQuery({
    queryKey: ['medical-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as MedicalRecord[]
    },
  })
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ['medical-records', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as MedicalRecord
    },
    enabled: !!id,
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMedicalRecordInput) => {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          ...input,
          status: 'OPEN',
        })
        .select()
        .single()

      if (error) throw error
      return data as MedicalRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreateMedicalRecordInput> }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as MedicalRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })
}
