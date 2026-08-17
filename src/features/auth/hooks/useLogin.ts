import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { LoginCredentials } from '@/types/user'

const LOCKED_PATTERN = /ACCOUNT_LOCKED|locked_until[:\s]+(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/i

function parseLockoutFromError(message: string): Date | null {
  const match = message.match(LOCKED_PATTERN)
  if (!match?.[1]) return null
  const parsed = new Date(match[1])
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'OWNER':
    case 'ADMIN':
    case 'DOKTER':
    case 'KASIR':
      return '/dashboard'
    case 'CUSTOMER':
      return '/portal'
    default:
      return '/dashboard'
  }
}

export function useLogin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null)

  const mutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await auth.login(credentials)
      const stored = localStorage.getItem('petora_session')
      return stored ? (JSON.parse(stored) as { user: { role: string } }) : null
    },
    onSuccess: (data) => {
      setLockoutUntil(null)
      const path = getDashboardPath(data?.user?.role ?? '')
      navigate(path)
    },
    onError: (err: Error) => {
      const lockout = parseLockoutFromError(err.message)
      if (lockout) {
        setLockoutUntil(lockout)
      }
    },
  })

  const resetError = useCallback(() => {
    mutation.reset()
    setLockoutUntil(null)
  }, [mutation])

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    lockoutUntil,
    resetError,
  }
}
