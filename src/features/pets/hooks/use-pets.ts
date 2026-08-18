import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Pet, CreatePetInput, UpdatePetInput } from "@/types/pet";
import * as petService from "../services/pet.service";

interface UseCreatePetOptions {
  callerUserId?: string;
}

interface UseUpdatePetOptions {
  callerUserId?: string;
}

interface UseDeletePetOptions {
  callerUserId?: string;
}

export function usePets(customerId?: string) {
  return useQuery({
    queryKey: ["pets", customerId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("pets").select("*").is("deleted_at", null);

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data as Pet[];
    },
  });
}

export function usePet(id: string) {
  return useQuery({
    queryKey: ["pets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Pet;
    },
    enabled: !!id,
  });
}

export function useCreatePet(options?: UseCreatePetOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreatePetInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petService.createPet(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}

export function useUpdatePet(options?: UseUpdatePetOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePetInput;
    }) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petService.updatePet(id, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}

export function useDeletePet(options?: UseDeletePetOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return petService.deletePet(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}
