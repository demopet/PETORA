import { useCallback, useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { NumericKeypad } from './NumericKeypad'

interface LoginFormProps {
  onSubmit: (credentials: { username: string; pin: string }) => void
  isLoading?: boolean
  error?: string | null
  lockoutUntil?: Date | null
}

function formatLockoutMessage(remainingSeconds: number): string {
  const minutes = Math.ceil(remainingSeconds / 60)
  return `Akun terkunci. Coba lagi dalam ${minutes} menit`
}

export function LoginForm({ onSubmit, isLoading = false, error = null, lockoutUntil = null }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0)

  const isLockedOut = useMemo(() => {
    if (!lockoutUntil) return false
    return lockoutUntil.getTime() > Date.now()
  }, [lockoutUntil])

  useEffect(() => {
    if (!lockoutUntil || lockoutUntil.getTime() <= Date.now()) {
      setLockoutRemaining(0)
      return
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000))
      setLockoutRemaining(remaining)
      if (remaining <= 0) return
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)
    return () => clearInterval(interval)
  }, [lockoutUntil])

  const validate = useCallback((): boolean => {
    let valid = true

    if (!username.trim()) {
      setUsernameError('Username wajib diisi')
      valid = false
    } else if (username.trim().length < 3) {
      setUsernameError('Username minimal 3 karakter')
      valid = false
    } else {
      setUsernameError(null)
    }

    if (!pin) {
      setPinError('PIN wajib diisi')
      valid = false
    } else if (!/^\d{6}$/.test(pin)) {
      setPinError('PIN harus 6 digit angka')
      valid = false
    } else {
      setPinError(null)
    }

    return valid
  }, [username, pin])

  const handleSubmit = useCallback(() => {
    if (!validate()) return
    onSubmit({ username: username.trim(), pin })
  }, [validate, onSubmit, username, pin])

  const handlePinChange = useCallback((value: string) => {
    setPin(value)
    if (pinError) setPinError(null)
  }, [pinError])

  const combinedError = pinError || error

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="text"
        label="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value)
          if (usernameError) setUsernameError(null)
        }}
        placeholder="Masukkan username"
        error={usernameError ?? undefined}
        disabled={isLoading || isLockedOut}
        autoComplete="username"
        autoFocus
      />

      {isLockedOut && lockoutRemaining > 0 && (
        <p className="text-sm font-medium text-danger-600" data-testid="lockout-message">
          {formatLockoutMessage(lockoutRemaining)}
        </p>
      )}

      <NumericKeypad
        value={pin}
        onChange={handlePinChange}
        onSubmit={handleSubmit}
        error={combinedError}
        disabled={isLoading || isLockedOut}
        isLoading={isLoading}
      />

      <p className="text-center text-sm text-slate-500">
        Lupa PIN? Hubungi admin
      </p>
    </div>
  )
}
