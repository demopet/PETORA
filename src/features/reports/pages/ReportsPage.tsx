import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { DollarSign, Users, Calendar, PawPrint } from 'lucide-react'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: revenue } = useQuery({
    queryKey: ['reports', 'revenue', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('total_amount, created_at')
        .eq('status', 'PAID')

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query
      if (error) throw error
      return data as { total_amount: number; created_at: string }[]
    },
  })

  const totalRevenue = revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

  const columns = [
    { header: 'Date', accessorKey: 'created_at' as const },
    { header: 'Revenue', accessorKey: 'total_amount' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">View and export business reports</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="Total Invoices"
          value={String(revenue?.length || 0)}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Customers"
          value="0"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Pets"
          value="0"
          icon={<PawPrint className="h-6 w-6" />}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Revenue Details</h2>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <label className="label">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={revenue || []}
            emptyState={
              <div className="py-8 text-center text-sm text-slate-500">
                No data available
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}
