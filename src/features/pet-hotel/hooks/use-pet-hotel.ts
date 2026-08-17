import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { PetHotelBooking, CreatePetHotelBookingInput, PetHotelLog } from '@/types/pet-hotel'

export function usePetHotelBookings() {
  return useQuery({
    queryKey: ['pet-hotel-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .select('*, pet_hotel_logs(*)')
        .order('check_in_date', { ascending: false })

      if (error) throw error
      return data as (PetHotelBooking & { pet_hotel_logs: PetHotelLog[] })[]
    },
  })
}

export function usePetHotelBooking(id: string) {
  return useQuery({
    queryKey: ['pet-hotel-bookings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .select('*, pet_hotel_logs(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as PetHotelBooking & { pet_hotel_logs: PetHotelLog[] }
    },
    enabled: !!id,
  })
}

export function useCreatePetHotelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePetHotelBookingInput) => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .insert({
          ...input,
          booking_number: `PH-${Date.now()}`,
          status: 'BOOKED',
        })
        .select()
        .single()

      if (error) throw error
      return data as PetHotelBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-hotel-bookings'] })
    },
  })
}

export function useCheckInBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .update({ status: 'CHECKED_IN', actual_check_in_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as PetHotelBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-hotel-bookings'] })
    },
  })
}

export function useCheckOutBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .update({ status: 'CHECKED_OUT', actual_check_out_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as PetHotelBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-hotel-bookings'] })
    },
  })
}

export function useCancelPetHotelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pet_hotel_bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as PetHotelBooking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-hotel-bookings'] })
    },
  })
}
