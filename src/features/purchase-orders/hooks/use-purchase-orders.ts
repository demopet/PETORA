import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  PurchaseOrder,
  CreatePurchaseOrderInput,
  PurchaseOrderItem,
} from "@/types/purchase-order";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, purchase_order_items(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PurchaseOrder & {
        purchase_order_items: PurchaseOrderItem[];
      };
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert({
          ...input,
          po_number: `PO-${Date.now()}`,
          status: "DRAFT",
        })
        .select()
        .single();

      if (error) throw error;
      return data as PurchaseOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PurchaseOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
