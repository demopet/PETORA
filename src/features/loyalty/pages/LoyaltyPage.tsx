import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoyaltyMembers } from '../hooks/use-loyalty'
import type { LoyaltyMember, LoyaltyTierConfig } from '@/types/loyalty'

export default function LoyaltyPage() {
  const [search, setSearch] = useState('')
  const { data: members, isLoading, error } = useLoyaltyMembers()

  const filteredMembers = members?.filter((member) =>
    member.customer_id.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Member ID',
      accessorKey: 'customer_id' as const,
      cell: ({ original }: { original: LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig } }) => (
        <div className="font-medium text-slate-900">{original.customer_id}</div>
      ),
    },
    {
      header: 'Tier',
      accessorKey: 'tier_id' as const,
      cell: ({ original }: { original: LoyaltyMember & { loyalty_tiers: LoyaltyTierConfig } }) =>
        original.loyalty_tiers?.tier_name || '-',
    },
    {
      header: 'Total Points',
      accessorKey: 'total_points' as const,
      cell: ({ original }: { original: LoyaltyMember }) => (
        <div className="font-medium text-primary-600">{original.total_points}</div>
      ),
    },
    {
      header: 'Available Points',
      accessorKey: 'available_points' as const,
      cell: ({ original }: { original: LoyaltyMember }) => (
        <div className="font-medium">{original.available_points}</div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading loyalty members...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading loyalty members</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loyalty Program</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredMembers?.length || 0} members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredMembers || []}
        searchKey="customer_id"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No loyalty members found"
            description="Get started by adding your first loyalty member."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            }
          />
        }
      />
    </div>
  )
}
