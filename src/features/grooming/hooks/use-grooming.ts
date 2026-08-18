import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  GroomingBooking,
  CreateGroomingBookingInput,
  GroomingService,
  CreateGroomingRecordInput,
} from "@/types/grooming";
import * as groomingService from "../services/grooming.service";

interface UseGroomingOptions {
  callerUserId?: string;
}

export function useGroomingBookings() {
  return useQuery({
    queryKey: ["grooming-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*")
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data as GroomingBooking[];
    },
  });
}

export function useGroomingBooking(id: string) {
  return useQuery({
    queryKey: ["grooming-bookings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as GroomingBooking;
    },
    enabled: !!id,
  });
}

export function useGroomingServices() {
  return useQuery({
    queryKey: ["grooming-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grooming_services")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as GroomingService[];
    },
  });
}

export function useCreateGroomingBooking(options?: UseGroomingOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreateGroomingBookingInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return groomingService.createGroomingBooking(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-bookings"] });
    },
  });
}

export function useStartGrooming(options?: UseGroomingOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return groomingService.startGrooming(bookingId, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-bookings"] });
    },
  });
}

export function useFinishGrooming(options?: UseGroomingOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async ({
      bookingId,
      input,
    }: {
      bookingId: string;
      input: CreateGroomingRecordInput;
    }) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return groomingService.finishGrooming(bookingId, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-bookings"] });
    },
  });
}

export function useCancelGroomingBooking(options?: UseGroomingOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return groomingService.cancelGrooming(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-bookings"] });
    },
  });
}
