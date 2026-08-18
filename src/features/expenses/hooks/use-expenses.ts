import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateExpenseInput } from "@/types/expense";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  reverseExpense,
} from "../services/expense.service";

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => getExpenses(),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      callerUserId,
    }: {
      input: CreateExpenseInput;
      callerUserId: string;
    }) => createExpense(input, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
      callerUserId,
    }: {
      id: string;
      input: { status?: string; amount?: number; description?: string };
      callerUserId: string;
    }) => updateExpense(id, input, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, callerUserId }: { id: string; callerUserId: string }) =>
      approveExpense(id, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, callerUserId }: { id: string; callerUserId: string }) =>
      rejectExpense(id, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useReverseExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      callerUserId,
    }: {
      id: string;
      reason: string;
      callerUserId: string;
    }) => reverseExpense(id, reason, callerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
