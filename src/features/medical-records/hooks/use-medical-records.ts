import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  MedicalRecord,
  CreateMedicalRecordInput,
} from "@/types/medical-record";
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

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMedicalRecordInput) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return createMedicalRecord(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateMedicalRecordInput>;
    }) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return updateMedicalRecord(id, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const callerUserId = (await getCurrentUserId()) ?? "";
      return deleteMedicalRecord(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}
