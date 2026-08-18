import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  PetHotelBooking,
  CreatePetHotelBookingInput,
  PetHotelLog,
  CreatePetHotelLogInput,
} from "@/types/pet-hotel";
import * as petHotelService from "../services/pet-hotel.service";

interface UsePetHotelOptions {
  callerUserId?: string;
}

export function usePetHotelBookings() {
  return useQuery({
    queryKey: ["pet-hotel-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_hotel_bookings")
        .select("*, pet_hotel_logs(*)")
        .order("check_in_date", { ascending: false });

      if (error) throw error;
      return data as (PetHotelBooking & { pet_hotel_logs: PetHotelLog[] })[];
    },
  });
}

export function usePetHotelBooking(id: string) {
  return useQuery({
    queryKey: ["pet-hotel-bookings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_hotel_bookings")
        .select("*, pet_hotel_logs(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PetHotelBooking & { pet_hotel_logs: PetHotelLog[] };
    },
    enabled: !!id,
  });
}

export function useCreatePetHotelBooking(options?: UsePetHotelOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreatePetHotelBookingInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petHotelService.createPetHotelBooking(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-hotel-bookings"] });
    },
  });
}

export function useCheckInBooking(options?: UsePetHotelOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petHotelService.checkInBooking(bookingId, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-hotel-bookings"] });
    },
  });
}

export function useCheckOutBooking(options?: UsePetHotelOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petHotelService.checkOutBooking(bookingId, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-hotel-bookings"] });
    },
  });
}

export function useAddPetHotelLog(options?: UsePetHotelOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreatePetHotelLogInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petHotelService.addPetHotelLog(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-hotel-bookings"] });
    },
  });
}

export function useCancelPetHotelBooking(options?: UsePetHotelOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petHotelService.cancelPetHotelBooking(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-hotel-bookings"] });
    },
  });
}
