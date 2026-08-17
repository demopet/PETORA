import { useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGroomingBookings } from '../hooks/use-grooming'
import { useCancelGroomingBooking } from '../hooks/use-grooming'
import type { GroomingBooking } from '@/types/grooming'

export default function GroomingPage() {
  const [search, setSearch] = useState('')
  const { data: bookings, isLoading, error } = useGroomingBookings()
  const cancelMutation = useCancelGroomingBooking()

  const filteredBookings = bookings?.filter((booking) =>
    booking.booking_number.toLowerCase().includes(search.toLowerCase()) ||
    booking.customer_id.toLowerCase().includes(search.toLowerCase())
  )

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancelMutation.mutateAsync(id)
    }
  }

  const columns = [
    {
      header: 'Booking #',
      accessorKey: 'booking_number' as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <div className="font-medium text-slate-900">{original.booking_number}</div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'appointment_date' as const,
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCancel(original.id)}
          >
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading grooming bookings...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading grooming bookings</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grooming</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredBookings?.length || 0} bookings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBookings || []}
        searchKey="booking_number"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No grooming bookings found"
            description="Get started by creating your first booking."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            }
          />
        }
      />
    </div>
  )
}
