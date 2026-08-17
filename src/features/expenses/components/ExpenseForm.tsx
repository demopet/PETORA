import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectOption } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_data: {
    category_id: string
    amount: number
    expense_date: string
    description?: string
    receipt_url?: string
    is_recurring?: boolean
    recurring_day?: number
  }) => void
  categories: Array<{ id: string; name: string }>
  initialData?: {
    id?: string
    category_id?: string
    amount?: number
    expense_date?: string
    description?: string
    receipt_url?: string
    is_recurring?: boolean
    recurring_day?: number
  }
}
export function ExpenseForm({ open, onOpenChange, onSubmit, categories, initialData }: ExpenseFormProps) {

  const defaultExpenseDate = React.useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [formData, setFormData] = React.useState<{
    category_id: string
    amount: string
    expense_date: string
    description: string
    receipt_url: string
    is_recurring: boolean
    recurring_day: string
  }>({
    category_id: initialData?.category_id || '',
    amount: initialData?.amount?.toString() || '',
    expense_date: initialData?.expense_date ?? defaultExpenseDate,
    description: initialData?.description || '',
    receipt_url: initialData?.receipt_url || '',
    is_recurring: initialData?.is_recurring || false,
    recurring_day: initialData?.recurring_day?.toString() || '',
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        category_id: initialData.category_id || '',
        amount: initialData.amount?.toString() || '',
        expense_date: initialData.expense_date ?? defaultExpenseDate,
        description: initialData.description || '',
        receipt_url: initialData.receipt_url || '',
        is_recurring: initialData.is_recurring || false,
        recurring_day: initialData.recurring_day?.toString() || '',
      })
    }
  }, [initialData, defaultExpenseDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      expense_date: formData.expense_date || new Date().toISOString().slice(0, 10),
      amount: parseFloat(formData.amount) || 0,
      recurring_day: formData.is_recurring ? parseInt(formData.recurring_day) || undefined : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category" required>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              placeholder="Select category"
            >
              {categories.map((category) => (
                <SelectOption key={category.id} value={category.id}>
                  {category.name}
                </SelectOption>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" required>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                required
              />
            </FormField>

            <FormField label="Date" required>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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

          <FormField label="Receipt URL">
            <Input
              value={formData.receipt_url}
              onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
              placeholder="https://..."
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="is_recurring">Recurring expense</Label>
          </div>

          {formData.is_recurring && (
            <FormField label="Recurring Day">
              <Select
                value={formData.recurring_day}
                onValueChange={(value) => setFormData({ ...formData, recurring_day: value })}
                placeholder="Select day"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectOption key={day} value={day.toString()}>
                    {day}
                  </SelectOption>
                ))}
              </Select>
            </FormField>
          )}

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
