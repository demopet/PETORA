import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  Invoice,
  CreateInvoiceInput,
  RecordPaymentInput,
} from "@/types/invoice";
import * as invoiceService from "../services/invoice.service";

interface UseCreateInvoiceOptions {
  callerUserId?: string;
}

interface UseRecordPaymentOptions {
  callerUserId?: string;
}

interface UseCancelInvoiceOptions {
  callerUserId?: string;
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice(options?: UseCreateInvoiceOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return invoiceService.createInvoice(input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRecordPayment(options?: UseRecordPaymentOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async ({
      invoiceId,
      input,
    }: {
      invoiceId: string;
      input: RecordPaymentInput;
    }) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return invoiceService.recordPayment(invoiceId, input, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useCancelInvoice(options?: UseCancelInvoiceOptions) {
  const queryClient = useQueryClient();
  const callerUserId = options?.callerUserId;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!callerUserId) {
        throw new Error("callerUserId is required");
      }
      return invoiceService.cancelInvoice(id, callerUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
