import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useInvoices } from '../hooks/use-invoices'
import type { Invoice } from '@/types/invoice'

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const { data: invoices, isLoading, error } = useInvoices()

  const filteredInvoices = invoices?.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_id?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Invoice #',
      accessorKey: 'invoice_number' as const,
      cell: ({ original }: { original: Invoice }) => (
        <div className="font-medium text-slate-900">{original.invoice_number}</div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'invoice_type' as const,
    },
    {
      header: 'Total',
      accessorKey: 'total_amount' as const,
      cell: ({ original }: { original: Invoice }) => (
        <div className="font-medium">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(original.total_amount)}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: ({ original }: { original: Invoice }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: 'Date',
      accessorKey: 'created_at' as const,
      cell: ({ original }: { original: Invoice }) => (
        <div className="text-sm text-slate-500">
          {new Date(original.created_at).toLocaleDateString('id-ID')}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading invoices...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading invoices</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredInvoices?.length || 0} invoices
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices || []}
        searchKey="invoice_number"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No invoices found"
            description="Get started by creating your first invoice."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            }
          />
        }
      />
    </div>
  )
}
