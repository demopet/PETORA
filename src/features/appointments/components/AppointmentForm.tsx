import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectOption } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AppointmentFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_data: {
    customer_id: string
    pet_id: string
    doctor_id?: string
    appointment_date: string
    appointment_time: string
    complaint?: string
    notes?: string
  }) => void
  customers: Array<{ id: string; name: string }>
  pets: Array<{ id: string; name: string; customer_id: string }>
  doctors: Array<{ id: string; full_name: string }>
  initialData?: {
    id?: string
    customer_id?: string
    pet_id?: string
    doctor_id?: string
    appointment_date?: string
    appointment_time?: string
    complaint?: string
    notes?: string
  }
}

export function AppointmentForm({ open, onOpenChange, onSubmit, customers, pets, doctors, initialData }: AppointmentFormProps) {
  const [formData, setFormData] = React.useState({
    customer_id: initialData?.customer_id || '',
    pet_id: initialData?.pet_id || '',
    doctor_id: initialData?.doctor_id || '',
    appointment_date: initialData?.appointment_date || '',
    appointment_time: initialData?.appointment_time || '',
    complaint: initialData?.complaint || '',
    notes: initialData?.notes || '',
  })

  const filteredPets = pets.filter((pet) => pet.customer_id === formData.customer_id)

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        customer_id: initialData.customer_id || '',
        pet_id: initialData.pet_id || '',
        doctor_id: initialData.doctor_id || '',
        appointment_date: initialData.appointment_date || '',
        appointment_time: initialData.appointment_time || '',
        complaint: initialData.complaint || '',
        notes: initialData.notes || '',
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
          <DialogTitle>{initialData ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Customer" required>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value, pet_id: '' })}
              placeholder="Select customer"
            >
              {customers.map((customer) => (
                <SelectOption key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectOption>
              ))}
            </Select>
          </FormField>

          <FormField label="Pet" required>
            <Select
              value={formData.pet_id}
              onValueChange={(value) => setFormData({ ...formData, pet_id: value })}
              placeholder="Select pet"
              
            >
              {filteredPets.map((pet) => (
                <SelectOption key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectOption>
              ))}
            </Select>
          </FormField>

          <FormField label="Doctor">
            <Select
              value={formData.doctor_id}
              onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
              placeholder="Select doctor"
            >
              {doctors.map((doctor) => (
                <SelectOption key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                </SelectOption>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Time" required>
              <Input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Complaint">
            <Textarea
              value={formData.complaint}
              onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
              placeholder="Enter complaint or reason for visit"
              rows={3}
            />
          </FormField>

          <FormField label="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter additional notes"
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
