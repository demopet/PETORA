import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppointmentForm } from '../components/AppointmentForm'
import { useAppointments, useCreateAppointment } from '../hooks/use-appointments'
import { useCustomers } from '@/features/customers/hooks/use-customers'
import { usePets } from '@/features/pets/hooks/use-pets'
import type { Appointment } from '@/types/appointment'

export default function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const { data: appointments, isLoading, error } = useAppointments()
  const { data: customers } = useCustomers()
  const { data: pets } = usePets()
  const createAppointmentMutation = useCreateAppointment()

  const filteredAppointments = appointments?.filter((apt) =>
    apt.complaint?.toLowerCase().includes(search.toLowerCase()) ||
    apt.customer_id.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Date',
      accessorKey: 'appointment_date' as const,
    },
    {
      header: 'Time',
      accessorKey: 'appointment_time' as const,
    },
    {
      header: 'Customer',
      accessorKey: 'customer_id' as const,
      cell: ({ original }: { original: Appointment }) => (
        <div className="font-medium text-slate-900">{original.customer_id}</div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: ({ original }: { original: Appointment }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: 'Queue',
      accessorKey: 'queue_number' as const,
      cell: ({ original }: { original: Appointment }) => original.queue_number || '-',
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading appointments...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading appointments</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredAppointments?.length || 0} appointments
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAppointments || []}
        searchKey="appointment_date"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No appointments found"
            description="Get started by creating your first appointment."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                New Appointment
              </Button>
            }
          />
        }
      />

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          await createAppointmentMutation.mutateAsync({
            ...data,
            doctor_id: data.doctor_id || undefined,
            complaint: data.complaint || undefined,
            notes: data.notes || undefined,
            is_from_portal: false,
          })
        }}
        customers={customers?.map(c => ({ id: c.id, name: c.name })) || []}
        pets={pets?.map(p => ({ id: p.id, name: p.name, customer_id: p.customer_id })) || []}
        doctors={[]}
      />
    </div>
  )
}
