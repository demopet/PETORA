import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  Appointment,
  CreateAppointmentInput,
  AppointmentStatus,
} from "@/types/appointment";
import {
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "../services/appointment.service";

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: ["appointments", date],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (date) {
        query = query.eq("appointment_date", date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    enabled: !!id,
  });
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return createAppointment(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AppointmentStatus;
    }) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return updateAppointmentStatus(id, { status }, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return cancelAppointment(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
