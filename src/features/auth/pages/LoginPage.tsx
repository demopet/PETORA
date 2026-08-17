import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { login } from '../services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => login({ username, pin }),
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Petora</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sistem Manajemen Terpadu Petshop & Petcare
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="label">PIN</label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan 6 digit PIN"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
