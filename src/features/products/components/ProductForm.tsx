import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectOption } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ProductFormProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  onSubmit: (_data: {
    sku: string
    name: string
    category_id?: string
    supplier_id?: string
    barcode?: string
    description?: string
    purchase_price: number
    selling_price: number
    stock_quantity?: number
    stock_minimum?: number
    stock_maximum?: number
    expiry_date?: string
  }) => void
  categories: Array<{ id: string; name: string }>
  suppliers: Array<{ id: string; name: string }>
  initialData?: {
    id?: string
    sku?: string
    name?: string
    category_id?: string
    supplier_id?: string
    barcode?: string
    description?: string
    purchase_price?: number
    selling_price?: number
    stock_quantity?: number
    stock_minimum?: number
    stock_maximum?: number
    expiry_date?: string
  }
}

export function ProductForm({ open, onOpenChange, onSubmit, categories, suppliers, initialData }: ProductFormProps) {
  const [formData, setFormData] = React.useState({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    supplier_id: initialData?.supplier_id || '',
    barcode: initialData?.barcode || '',
    description: initialData?.description || '',
    purchase_price: initialData?.purchase_price?.toString() || '',
    selling_price: initialData?.selling_price?.toString() || '',
    stock_quantity: initialData?.stock_quantity?.toString() || '0',
    stock_minimum: initialData?.stock_minimum?.toString() || '0',
    stock_maximum: initialData?.stock_maximum?.toString() || '100',
    expiry_date: initialData?.expiry_date || '',
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        supplier_id: initialData.supplier_id || '',
        barcode: initialData.barcode || '',
        description: initialData.description || '',
        purchase_price: initialData.purchase_price?.toString() || '',
        selling_price: initialData.selling_price?.toString() || '',
        stock_quantity: initialData.stock_quantity?.toString() || '0',
        stock_minimum: initialData.stock_minimum?.toString() || '0',
        stock_maximum: initialData.stock_maximum?.toString() || '100',
        expiry_date: initialData.expiry_date || '',
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      stock_minimum: parseInt(formData.stock_minimum) || 0,
      stock_maximum: parseInt(formData.stock_maximum) || 100,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU" required>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                required
              />
            </FormField>

            <FormField label="Barcode">
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </FormField>
          </div>

          <FormField label="Product Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
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

            <FormField label="Supplier">
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                placeholder="Select supplier"
              >
                {suppliers.map((supplier) => (
                  <SelectOption key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectOption>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Price" required>
              <Input
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="0"
                required
              />
            </FormField>

            <FormField label="Selling Price" required>
              <Input
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="0"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Stock Qty">
              <Input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Min Stock">
              <Input
                type="number"
                value={formData.stock_minimum}
                onChange={(e) => setFormData({ ...formData, stock_minimum: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Max Stock">
              <Input
                type="number"
                value={formData.stock_maximum}
                onChange={(e) => setFormData({ ...formData, stock_maximum: e.target.value })}
                placeholder="100"
              />
            </FormField>
          </div>

          <FormField label="Expiry Date">
            <Input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
