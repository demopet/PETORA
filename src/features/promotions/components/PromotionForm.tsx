import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectOption } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PromotionFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_data: {
    code?: string
    name: string
    description?: string
    promotion_type: string
    discount_value: number
    min_purchase?: number
    max_usage?: number
    start_date: string
    end_date: string
    applicable_products?: string[]
  }) => void
  products: Array<{ id: string; name: string }>
  initialData?: {
    id?: string
    code?: string
    name?: string
    description?: string
    promotion_type?: string
    discount_value?: number
    min_purchase?: number
    max_usage?: number
    start_date?: string
    end_date?: string
    applicable_products?: string[]
  }
}

export function PromotionForm({ open, onOpenChange, onSubmit, products: _products, initialData }: PromotionFormProps) {
  const [formData, setFormData] = React.useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    promotion_type: initialData?.promotion_type || 'PERCENTAGE',
    discount_value: initialData?.discount_value?.toString() || '',
    min_purchase: initialData?.min_purchase?.toString() || '0',
    max_usage: initialData?.max_usage?.toString() || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    applicable_products: initialData?.applicable_products || [],
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        promotion_type: initialData.promotion_type || 'PERCENTAGE',
        discount_value: initialData.discount_value?.toString() || '',
        min_purchase: initialData.min_purchase?.toString() || '0',
        max_usage: initialData.max_usage?.toString() || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        applicable_products: initialData.applicable_products || [],
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const maxUsage = formData.max_usage ? parseInt(formData.max_usage) : undefined
    const submitData: {
      code?: string
      name: string
      description?: string
      promotion_type: string
      discount_value: number
      min_purchase?: number
      max_usage?: number
      start_date: string
      end_date: string
      applicable_products?: string[]
    } = {
      code: formData.code || undefined,
      name: formData.name,
      description: formData.description || undefined,
      promotion_type: formData.promotion_type,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_purchase: parseFloat(formData.min_purchase) || 0,
      max_usage: maxUsage,
      start_date: formData.start_date,
      end_date: formData.end_date,
      applicable_products: formData.applicable_products.length > 0 ? formData.applicable_products : undefined,
    }
    onSubmit(submitData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Promotion Code">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., SUMMER2025"
              />
            </FormField>

            <FormField label="Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter promotion name"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <Select
                value={formData.promotion_type}
                onValueChange={(value) => setFormData({ ...formData, promotion_type: value })}
                placeholder="Select type"
              >
                <SelectOption value="PERCENTAGE">Percentage</SelectOption>
                <SelectOption value="FIXED">Fixed Amount</SelectOption>
                <SelectOption value="BUNDLE">Bundle</SelectOption>
                <SelectOption value="HAPPY_HOUR">Happy Hour</SelectOption>
                <SelectOption value="BIRTHDAY">Birthday</SelectOption>
              </Select>
            </FormField>

            <FormField label="Discount Value" required>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.promotion_type === 'PERCENTAGE' ? '10' : '50000'}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Min Purchase">
              <Input
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Max Usage">
              <Input
                type="number"
                value={formData.max_usage}
                onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                placeholder="Unlimited"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
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
