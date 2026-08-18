import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { MedicalRecord, CreateMedicalRecordInput } from "@/types/medical-record";
import {
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../services/medical-record.service";

export function useMedicalRecords() {
  return useQuery({
    queryKey: ["medical-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MedicalRecord[];
    },
  });
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ["medical-records", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MedicalRecord;
    },
    enabled: !!id,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateMedicalRecordInput) => {
      const callerUserId = user?.id ?? "";
      return createMedicalRecord(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreateMedicalRecordInput> }) => {
      const callerUserId = user?.id ?? "";
      return updateMedicalRecord(id, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const callerUserId = user?.id ?? "";
      return deleteMedicalRecord(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}
