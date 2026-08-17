import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePurchaseOrders } from '../hooks/use-purchase-orders'
import { useUpdatePurchaseOrderStatus } from '../hooks/use-purchase-orders'
import type { PurchaseOrder } from '@/types/purchase-order'

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('')
  const { data: orders, isLoading, error } = usePurchaseOrders()
  const updateStatusMutation = useUpdatePurchaseOrderStatus()

  const filteredOrders = orders?.filter((order) =>
    order.po_number.toLowerCase().includes(search.toLowerCase()) ||
    order.supplier_id.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatusMutation.mutateAsync({ id, status })
  }

  const columns = [
    {
      header: 'PO #',
      accessorKey: 'po_number' as const,
      cell: ({ original }: { original: PurchaseOrder }) => (
        <div className="font-medium text-slate-900">{original.po_number}</div>
      ),
    },
    {
      header: 'Supplier',
      accessorKey: 'supplier_id' as const,
    },
    {
      header: 'Total',
      accessorKey: 'total_amount' as const,
      cell: ({ original }: { original: PurchaseOrder }) => (
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
      cell: ({ original }: { original: PurchaseOrder }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as const,
      cell: ({ original }: { original: PurchaseOrder }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(original.id, 'RECEIVED')}
          >
            Receive
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading purchase orders...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading purchase orders</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredOrders?.length || 0} orders
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New PO
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders || []}
        searchKey="po_number"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No purchase orders found"
            description="Get started by creating your first purchase order."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                New PO
              </Button>
            }
          />
        }
      />
    </div>
  )
}
