import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectOption } from '@/components/ui/select'
import type { Pet } from '@/types/pet'

interface PetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    customer_id: string
    name: string
    species: string
    breed?: string
    birth_date?: string
    gender?: string
    microchip_number?: string
  }) => void
  customers: Array<{ id: string; name: string }>
  initialData?: Partial<Pet>
}

export function PetForm({ open, onOpenChange, onSubmit, customers, initialData }: PetFormProps) {
  const [formData, setFormData] = React.useState({
    customer_id: initialData?.customer_id || '',
    name: initialData?.name || '',
    species: initialData?.species || '',
    breed: initialData?.breed || '',
    birth_date: initialData?.birth_date || '',
    gender: initialData?.gender || '',
    microchip_number: initialData?.microchip_number || '',
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        customer_id: initialData.customer_id || '',
        name: initialData.name || '',
        species: initialData.species || '',
        breed: initialData.breed || '',
        birth_date: initialData.birth_date || '',
        gender: initialData.gender || '',
        microchip_number: initialData.microchip_number || '',
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
          <DialogTitle>{initialData ? 'Edit Pet' : 'Add Pet'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Owner" required>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              placeholder="Select owner"
            >
              {customers.map((customer) => (
                <SelectOption key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectOption>
              ))}
            </Select>
          </FormField>

          <FormField label="Pet Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter pet name"
              required
            />
          </FormField>

          <FormField label="Species" required>
            <Input
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              placeholder="Enter species (e.g., Dog, Cat)"
              required
            />
          </FormField>

          <FormField label="Breed">
            <Input
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="Enter breed"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Birth Date">
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </FormField>

            <FormField label="Gender">
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                placeholder="Select gender"
              >
                <SelectOption value="Male">Male</SelectOption>
                <SelectOption value="Female">Female</SelectOption>
              </Select>
            </FormField>
          </div>

          <FormField label="Microchip Number">
            <Input
              value={formData.microchip_number}
              onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
              placeholder="Enter microchip number"
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
