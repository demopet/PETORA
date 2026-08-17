import { useState, useEffect, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'

interface ChangePinFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_oldPin: string, _newPin: string) => void
  isLoading?: boolean
  error?: string | null
}

const PIN_LENGTH = 6
const PIN_REGEX = /^\d{6}$/

export function ChangePinForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  error = null,
}: ChangePinFormProps) {
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      setFieldErrors({})
    }
  }, [open])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!oldPin) {
      errors.oldPin = 'PIN lama wajib diisi'
    } else if (!PIN_REGEX.test(oldPin)) {
      errors.oldPin = `PIN lama harus ${PIN_LENGTH} digit`
    }

    if (!newPin) {
      errors.newPin = 'PIN baru wajib diisi'
    } else if (!PIN_REGEX.test(newPin)) {
      errors.newPin = `PIN baru harus ${PIN_LENGTH} digit`
    }

    if (!confirmPin) {
      errors.confirmPin = 'Konfirmasi PIN wajib diisi'
    } else if (confirmPin !== newPin) {
      errors.confirmPin = 'Konfirmasi PIN tidak cocok'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(oldPin, newPin)
  }

  const handlePinChange = (
    setter: (_value: string) => void,
    value: string,
  ) => {
    const sanitized = value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    setter(sanitized)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti PIN</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-500">
          Untuk keamanan, silakan ganti PIN Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="PIN Lama" required>
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              placeholder="Masukkan PIN lama"
              value={oldPin}
              onChange={(e) => handlePinChange(setOldPin, e.target.value)}
              error={fieldErrors.oldPin}
              disabled={isLoading}
              autoComplete="off"
            />
          </FormField>

          <FormField label="PIN Baru" required>
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              placeholder="Masukkan PIN baru"
              value={newPin}
              onChange={(e) => handlePinChange(setNewPin, e.target.value)}
              error={fieldErrors.newPin}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Konfirmasi PIN Baru" required>
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              placeholder="Masukkan kembali PIN baru"
              value={confirmPin}
              onChange={(e) => handlePinChange(setConfirmPin, e.target.value)}
              error={fieldErrors.confirmPin}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </FormField>

          {error && (
            <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Ganti PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
