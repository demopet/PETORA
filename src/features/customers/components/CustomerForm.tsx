import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    phone?: string
    email?: string
    address?: string
    emergency_contact?: string
    notes?: string
    is_guest?: boolean
    tags?: string[]
  }) => void
  initialData?: {
    name?: string
    phone?: string
    email?: string
    address?: string
    emergency_contact?: string
    notes?: string
    is_guest?: boolean
    tags?: string[]
  }
}

export function CustomerForm({ open, onOpenChange, onSubmit, initialData }: CustomerFormProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    emergency_contact: initialData?.emergency_contact || '',
    notes: initialData?.notes || '',
    is_guest: initialData?.is_guest || false,
    tags: initialData?.tags || [],
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        emergency_contact: initialData.emergency_contact || '',
        notes: initialData.notes || '',
        is_guest: initialData.is_guest || false,
        tags: initialData.tags || [],
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          </FormField>

          <FormField label="Phone">
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </FormField>

          <FormField label="Address">
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              rows={3}
            />
          </FormField>

          <FormField label="Emergency Contact">
            <Input
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              placeholder="Enter emergency contact"
            />
          </FormField>

          <FormField label="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter notes"
              rows={3}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
