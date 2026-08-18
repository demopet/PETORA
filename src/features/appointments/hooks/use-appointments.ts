import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { fetchPaginated } from "@/hooks/use-paginated-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from "@/types/appointment";
import {
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "../services/appointment.service";

export function useAppointments(date?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["appointments", date, page, limit],
    queryFn: () =>
      fetchPaginated<Appointment>("appointments", {
        page,
        limit,
        filter: date ? { appointment_date: date } : undefined,
        orderBy: { column: "appointment_date", ascending: true },
      }),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").eq("id", id).single();

      if (error) throw error;
      return data as Appointment;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const callerUserId = user?.id ?? "";
      return createAppointment(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const callerUserId = user?.id ?? "";
      return updateAppointmentStatus(id, { status }, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const callerUserId = user?.id ?? "";
      return cancelAppointment(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
