import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { fetchPaginated } from "@/hooks/use-paginated-query";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "@/types/customer";
import * as customerService from "../services/customer.service";

interface UseCreateCustomerOptions {
  callerUserId?: string;
}

interface UseUpdateCustomerOptions {
  callerUserId?: string;
}

interface UseDeleteCustomerOptions {
  callerUserId?: string;
}

export function useCustomers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["customers", page, limit],
    queryFn: () =>
      fetchPaginated<Customer>("customers", {
        page,
        limit,
        filter: { deleted_at: null },
        orderBy: { column: "name", ascending: true },
      }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer(options?: UseCreateCustomerOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return customerService.createCustomer(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer(options?: UseUpdateCustomerOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCustomerInput }) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return customerService.updateCustomer(id, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer(options?: UseDeleteCustomerOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return customerService.deleteCustomer(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useConvertGuest(options?: { callerUserId?: string }) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async ({
      customerId,
      username,
      pin,
    }: {
      customerId: string;
      username: string;
      pin: string;
    }) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return customerService.convertGuest(customerId, username, pin, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
