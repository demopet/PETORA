import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  Pet,
  Appointment,
  PetHotelBooking,
  GroomingBooking,
  Invoice,
  LoyaltyMember,
  LoyaltyTransaction,
} from "@/types";
import * as appointmentService from "@/features/appointments/services/appointment.service";
import * as petHotelService from "@/features/pet-hotel/services/pet-hotel.service";
import * as groomingService from "@/features/grooming/services/grooming.service";
import * as loyaltyService from "@/features/loyalty/services/loyalty.service";

export function usePortalPets(customerId: string) {
  return useQuery({
    queryKey: ["portal-pets", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("customer_id", customerId)
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!customerId,
  });
}

export function usePortalAppointments(customerId: string) {
  return useQuery({
    queryKey: ["portal-appointments", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("customer_id", customerId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!customerId,
  });
}

export function usePortalPetHotelBookings(customerId: string) {
  return useQuery({
    queryKey: ["portal-pet-hotel-bookings", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_hotel_bookings")
        .select("*")
        .eq("customer_id", customerId)
        .order("check_in_date", { ascending: false });

      if (error) throw error;
      return data as PetHotelBooking[];
    },
    enabled: !!customerId,
  });
}

export function usePortalGroomingBookings(customerId: string) {
  return useQuery({
    queryKey: ["portal-grooming-bookings", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grooming_bookings")
        .select("*")
        .eq("customer_id", customerId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data as GroomingBooking[];
    },
    enabled: !!customerId,
  });
}

export function usePortalInvoices(customerId: string) {
  return useQuery({
    queryKey: ["portal-invoices", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!customerId,
  });
}

export function usePortalLoyaltyMember(customerId: string) {
  return useQuery({
    queryKey: ["portal-loyalty-member", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_members")
        .select("*, loyalty_tiers(*)")
        .eq("customer_id", customerId)
        .maybeSingle();

      if (error) throw error;
      return (
        (data as
          | (LoyaltyMember & {
              loyalty_tiers: { tier_name: string; benefits: Record<string, unknown> };
            })
          | null) ?? null
      );
    },
    enabled: !!customerId,
  });
}

export function usePortalLoyaltyTransactions(memberId: string) {
  return useQuery({
    queryKey: ["portal-loyalty-transactions", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LoyaltyTransaction[];
    },
    enabled: !!memberId,
  });
}

export function useCreatePortalAppointment(callerUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      customer_id: string;
      pet_id: string;
      appointment_date: string;
      appointment_time: string;
      complaint?: string;
    }) => {
      return appointmentService.createAppointment(
        {
          ...input,
          is_from_portal: true,
        },
        callerUserId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-appointments"] });
    },
  });
}

export function useCreatePortalGroomingBooking(callerUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      customer_id: string;
      pet_id: string;
      service_id: string;
      appointment_date: string;
      appointment_time: string;
      notes?: string;
    }) => {
      return groomingService.createGroomingBooking(
        {
          ...input,
          is_from_portal: true,
        },
        callerUserId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-grooming-bookings"] });
    },
  });
}

export function useCreatePortalPetHotelBooking(callerUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      customer_id: string;
      pet_id: string;
      check_in_date: string;
      check_out_date: string;
      room_id?: string;
      special_notes?: string;
    }) => {
      return petHotelService.createPetHotelBooking(
        {
          ...input,
          is_from_portal: true,
        },
        callerUserId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-pet-hotel-bookings"] });
    },
  });
}

export function useRedeemPortalLoyaltyPoints(callerUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      customerId: string;
      pointsToRedeem: number;
      invoiceId?: string;
    }) => {
      return loyaltyService.redeemLoyaltyPoints(
        input.customerId,
        input.pointsToRedeem,
        input.invoiceId ?? null,
        callerUserId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-loyalty"] });
    },
  });
}
