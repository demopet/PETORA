import { useState } from 'react'
import { Plus, Search, Trash2, Edit, UserPlus } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomerForm } from '../components/CustomerForm'
import { useCustomers } from '../hooks/use-customers'
import { useDeleteCustomer } from '../hooks/use-customers'
import type { Customer } from '@/types/customer'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { data: customers, isLoading, error } = useCustomers()
  const deleteMutation = useDeleteCustomer()

  const filteredCustomers = customers?.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormOpen(true)
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as const,
      cell: ({ original }: { original: Customer }) => (
        <div>
          <div className="font-medium text-slate-900">{original.name}</div>
          <div className="text-sm text-slate-500">{original.phone}</div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email' as const,
      cell: ({ original }: { original: Customer }) => original.email || '-',
    },
    {
      header: 'Status',
      accessorKey: 'is_active' as const,
      cell: ({ original }: { original: Customer }) => (
        <StatusBadge status={original.is_active ? 'ACTIVE' : 'ARCHIVED'} />
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as const,
      cell: ({ original }: { original: Customer }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(original.id)}
          >
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading customers...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading customers</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredCustomers?.length || 0} customers
          </p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers || []}
        searchKey="name"
        emptyState={
          <EmptyState
            icon={<UserPlus className="h-12 w-12" />}
            title="No customers found"
            description="Get started by adding your first customer."
            action={
              <Button onClick={() => { setEditingCustomer(null); setFormOpen(true) }}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            }
          />
        }
      />

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(_data) => {
          if (editingCustomer) {
            // update mutation
          } else {
            // create mutation
          }
        }}
        initialData={editingCustomer ? {
          name: editingCustomer.name,
          phone: editingCustomer.phone ?? undefined,
          email: editingCustomer.email ?? undefined,
          address: editingCustomer.address ?? undefined,
          emergency_contact: editingCustomer.emergency_contact ?? undefined,
          notes: editingCustomer.notes ?? undefined,
          is_guest: editingCustomer.is_guest,
          tags: editingCustomer.tags,
        } : undefined}
      />
    </div>
  )
}
