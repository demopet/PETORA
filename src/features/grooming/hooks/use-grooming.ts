import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { GroomingBooking, CreateGroomingBookingInput } from '@/types/grooming'

export function useGroomingBookings() {
  return useQuery({
    queryKey: ['grooming-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grooming_bookings')
        .select('*')
        .order('appointment_date', { ascending: false })

      if (error) throw error
      return data as GroomingBooking[]
    },
  })
}

export function useGroomingBooking(id: string) {
  return useQuery({
    queryKey: ['grooming-bookings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grooming_bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as GroomingBooking
    },
    enabled: !!id,
  })
}

export function useCreateGroomingBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateGroomingBookingInput) => {
      const { data, error } = await supabase
        .from('grooming_bookings')
        .insert({
          ...input,
          booking_number: `GR-${Date.now()}`,
          status: 'BOOKED',
        })
        .select()
        .single()

      if (error) throw error
      return data as GroomingBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming-bookings'] })
    },
  })
}

export function useUpdateGroomingBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('grooming_bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as GroomingBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming-bookings'] })
    },
  })
}

export function useCancelGroomingBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('grooming_bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as GroomingBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming-bookings'] })
    },
  })
}
