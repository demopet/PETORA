import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'

interface ResetPinFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_newPin: string) => void
  userName: string
  isLoading?: boolean
}

export function ResetPinForm({ open, onOpenChange, onSubmit, userName, isLoading }: ResetPinFormProps) {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!newPin) {
      newErrors.newPin = 'PIN baru is required'
    } else if (!/^\d{6}$/.test(newPin)) {
      newErrors.newPin = 'PIN must be exactly 6 digits'
    }

    if (!confirmPin) {
      newErrors.confirmPin = 'Konfirmasi PIN is required'
    } else if (newPin !== confirmPin) {
      newErrors.confirmPin = 'PINs do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(newPin)
  }

  const handleReset = () => {
    setNewPin('')
    setConfirmPin('')
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) handleReset()
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset PIN — {userName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="PIN Baru" required>
            <Input
              type="text"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 digit angka"
              error={errors.newPin}
              maxLength={6}
            />
          </FormField>

          <FormField label="Konfirmasi PIN" required>
            <Input
              type="text"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Ulangi 6 digit angka"
              error={errors.confirmPin}
              maxLength={6}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Merese...' : 'Reset PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
