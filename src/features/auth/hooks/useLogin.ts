import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { LoginCredentials } from "@/types/user";

const LOCKED_PATTERN = /ACCOUNT_LOCKED|locked_until[:\s]+(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/i;

function parseLockoutFromError(message: string): Date | null {
  const match = message.match(LOCKED_PATTERN);
  if (!match?.[1]) return null;
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const MAX_FAILED_ATTEMPTS = 3;
const FRONTEND_LOCKOUT_MS = 30_000;

function getDashboardPath(role: string): string {
  switch (role) {
    case "OWNER":
    case "ADMIN":
    case "DOKTER":
    case "KASIR":
      return "/dashboard";
    case "CUSTOMER":
      return "/portal";
    default:
      return "/dashboard";
  }
}

export function useLogin() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const mutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await auth.login(credentials);
      return response.user;
    },
    onSuccess: (user) => {
      setLockoutUntil(null);
      setFailedAttempts(0);
      const path = getDashboardPath(user?.role ?? "");
      navigate(path);
    },
    onError: (err: Error) => {
      const serverLockout = parseLockoutFromError(err.message);
      if (serverLockout) {
        setLockoutUntil(serverLockout);
        setFailedAttempts(0);
        return;
      }

      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= MAX_FAILED_ATTEMPTS) {
          setLockoutUntil(new Date(Date.now() + FRONTEND_LOCKOUT_MS));
        }
        return next;
      });
    },
  });

  const resetError = useCallback(() => {
    mutation.reset();
    setLockoutUntil(null);
    setFailedAttempts(0);
  }, [mutation]);

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    lockoutUntil,
    failedAttempts,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts),
    resetError,
  };
}
