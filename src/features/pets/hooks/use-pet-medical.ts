import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  PetWeightLog,
  PetVaccine,
  PetDisease,
  PetAllergy,
} from "@/types/pet";

/**
 * Hooks for managing pet medical data:
 * - Weight logs
 * - Vaccines
 * - Diseases
 * - Allergies
 */

// ============================================================================
// WEIGHT LOG HOOKS
// ============================================================================

export interface CreateWeightLogInput {
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
}

export function usePetWeightLogs(petId?: string) {
  return useQuery({
    queryKey: ["pet-weight-logs", petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from("pet_weight_logs")
        .select("*")
        .eq("pet_id", petId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data as PetWeightLog[];
    },
    enabled: !!petId,
  });
}

export function useAddWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWeightLogInput) => {
      const { data, error } = await supabase
        .from("pet_weight_logs")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as PetWeightLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pet-weight-logs", data.pet_id],
      });
    },
  });
}

export function useDeleteWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: weightLog } = await supabase
        .from("pet_weight_logs")
        .select("pet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("pet_weight_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return weightLog;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["pet-weight-logs", data.pet_id],
        });
      }
    },
  });
}

// ============================================================================
// VACCINE HOOKS
// ============================================================================

export interface CreateVaccineInput {
  pet_id: string;
  vaccine_name: string;
  vaccination_date: string;
  due_date?: string | null;
  notes?: string;
}

export function usePetVaccines(petId?: string) {
  return useQuery({
    queryKey: ["pet-vaccines", petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from("pet_vaccines")
        .select("*")
        .eq("pet_id", petId)
        .is("deleted_at", null)
        .order("vaccination_date", { ascending: false });

      if (error) throw error;
      return data as PetVaccine[];
    },
    enabled: !!petId,
  });
}

export function useAddVaccine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVaccineInput) => {
      const { data, error } = await supabase
        .from("pet_vaccines")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as PetVaccine;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pet-vaccines", data.pet_id],
      });
    },
  });
}

export function useUpdateVaccine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateVaccineInput>;
    }) => {
      const { data: vaccine } = await supabase
        .from("pet_vaccines")
        .select("pet_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("pet_vaccines")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, pet_id: vaccine?.pet_id } as PetVaccine;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pet-vaccines", data.pet_id],
      });
    },
  });
}

export function useDeleteVaccine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: vaccine } = await supabase
        .from("pet_vaccines")
        .select("pet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("pet_vaccines")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return vaccine;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["pet-vaccines", data.pet_id],
        });
      }
    },
  });
}

// ============================================================================
// DISEASE HOOKS
// ============================================================================

export interface CreateDiseaseInput {
  pet_id: string;
  disease_name: string;
  diagnosed_date?: string | null;
  notes?: string;
}

export function usePetDiseases(petId?: string) {
  return useQuery({
    queryKey: ["pet-diseases", petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from("pet_diseases")
        .select("*")
        .eq("pet_id", petId)
        .is("deleted_at", null)
        .order("diagnosed_date", { ascending: false });

      if (error) throw error;
      return data as PetDisease[];
    },
    enabled: !!petId,
  });
}

export function useAddDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiseaseInput) => {
      const { data, error } = await supabase
        .from("pet_diseases")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as PetDisease;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pet-diseases", data.pet_id],
      });
    },
  });
}

export function useDeleteDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: disease } = await supabase
        .from("pet_diseases")
        .select("pet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("pet_diseases")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return disease;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["pet-diseases", data.pet_id],
        });
      }
    },
  });
}

// ============================================================================
// ALLERGY HOOKS
// ============================================================================

export interface CreateAllergyInput {
  pet_id: string;
  allergen: string;
  notes?: string;
}

export function usePetAllergies(petId?: string) {
  return useQuery({
    queryKey: ["pet-allergies", petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from("pet_allergies")
        .select("*")
        .eq("pet_id", petId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PetAllergy[];
    },
    enabled: !!petId,
  });
}

export function useAddAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAllergyInput) => {
      const { data, error } = await supabase
        .from("pet_allergies")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as PetAllergy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pet-allergies", data.pet_id],
      });
    },
  });
}

export function useDeleteAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: allergy } = await supabase
        .from("pet_allergies")
        .select("pet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("pet_allergies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return allergy;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["pet-allergies", data.pet_id],
        });
      }
    },
  });
}
