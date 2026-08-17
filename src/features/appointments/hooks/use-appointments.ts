import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Appointment, CreateAppointmentInput } from '@/types/appointment'

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (date) {
        query = query.eq('appointment_date', date)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Appointment[]
    },
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Appointment
    },
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...input,
          status: 'WAITING',
        })
        .select()
        .single()

      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
