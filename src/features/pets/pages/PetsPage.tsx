import { useState } from 'react'
import { useDeletePet } from '../hooks/use-pets'
import { Plus, Search, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePets } from '../hooks/use-pets'
import type { Pet } from '@/types/pet'

interface PetsPageProps {
  customerId?: string
}

export default function PetsPage({ customerId }: PetsPageProps) {
  const [search, setSearch] = useState('')
  const { data: pets, isLoading, error } = usePets(customerId)
  const deleteMutation = useDeletePet()

  const filteredPets = pets?.filter((pet) =>
    pet.name.toLowerCase().includes(search.toLowerCase()) ||
    pet.species.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as const,
      cell: ({ row }: { row: { original: Pet } }) => (
        <div className="font-medium text-slate-900">{row.original.name}</div>
      ),
    },
    {
      header: 'Species',
      accessorKey: 'species' as const,
    },
    {
      header: 'Breed',
      accessorKey: 'breed' as const,
      cell: ({ row }: { row: { original: Pet } }) => row.original.breed || '-',
    },
    {
      header: 'Gender',
      accessorKey: 'gender' as const,
      cell: ({ row }: { row: { original: Pet } }) => row.original.gender || '-',
    },
    {
      header: 'Actions',
      accessorKey: 'id' as const,
      cell: ({ row }: { row: { original: Pet } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="text-slate-500">Loading pets...</div>
  }

  if (error) {
    return <div className="text-danger-500">Error loading pets</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pets</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPets?.length || 0} pets
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Pet
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search pets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPets || []}
        searchKey="name"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No pets found"
            description="Get started by adding your first pet."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                Add Pet
              </Button>
            }
          />
        }
      />
    </div>
  )
}
