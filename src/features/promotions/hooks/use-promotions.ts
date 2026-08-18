import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePromotionInput } from "@/types/promotion";
import {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  cancelPromotion,
  validatePromoCode,
} from "../services/promotion.service";

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async () => getPromotions(),
  });
}

export function usePromotion(id: string) {
  return useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => getPromotion(id),
    enabled: !!id,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      callerUserId,
    }: {
      input: CreatePromotionInput;
      callerUserId: string;
    }) => createPromotion(input, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
      callerUserId,
    }: {
      id: string;
      input: Partial<CreatePromotionInput>;
      callerUserId: string;
    }) => updatePromotion(id, input, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useCancelPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, callerUserId }: { id: string; callerUserId: string }) =>
      cancelPromotion(id, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: async ({
      code,
      subtotal,
      customerId,
      callerUserId,
      items,
    }: {
      code: string;
      subtotal: number;
      customerId?: string;
      callerUserId: string;
      items?: { product_id?: string }[];
    }) => validatePromoCode(code, subtotal, customerId ?? null, callerUserId, items),
  });
}
