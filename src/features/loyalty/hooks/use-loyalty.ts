import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLoyaltyMembers,
  getLoyaltyMember,
  getLoyaltyTransactions,
  earnLoyaltyPoints,
  redeemLoyaltyPoints,
} from "../services/loyalty.service";

export function useLoyaltyMembers() {
  return useQuery({
    queryKey: ["loyalty-members"],
    queryFn: async () => getLoyaltyMembers(),
  });
}

export function useLoyaltyMember(customerId: string) {
  return useQuery({
    queryKey: ["loyalty-members", customerId],
    queryFn: async () => getLoyaltyMember(customerId),
    enabled: !!customerId,
  });
}

export function useLoyaltyTransactions(memberId: string) {
  return useQuery({
    queryKey: ["loyalty-transactions", memberId],
    queryFn: async () => getLoyaltyTransactions(memberId),
    enabled: !!memberId,
  });
}

export function useEarnLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      invoiceId,
      totalAmount,
      callerUserId,
    }: {
      customerId: string;
      invoiceId: string;
      totalAmount: number;
      callerUserId: string;
    }) => earnLoyaltyPoints(customerId, invoiceId, totalAmount, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-members"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-transactions"] });
    },
  });
}

export function useRedeemLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      points,
      invoiceId,
      callerUserId,
    }: {
      customerId: string;
      points: number;
      invoiceId?: string;
      callerUserId: string;
    }) => redeemLoyaltyPoints(customerId, points, invoiceId ?? null, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-members"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-transactions"] });
    },
  });
}
