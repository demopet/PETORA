import { useState } from "react";
import { Plus, Search, Trash2, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PetForm } from "../components/PetForm";
import {
  usePets,
  useCreatePet,
  useUpdatePet,
  useDeletePet,
} from "../hooks/use-pets";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Pet } from "@/types/pet";

interface PetsPageProps {
  customerId?: string;
}

export default function PetsPage({ customerId }: PetsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const { data: pets, isLoading, error } = usePets(customerId);
  const { data: customers } = useCustomers();
  const createMutation = useCreatePet({ callerUserId: user?.id });
  const updateMutation = useUpdatePet({ callerUserId: user?.id });
  const deleteMutation = useDeletePet({ callerUserId: user?.id });

  const filteredPets = pets?.filter(
    (pet) =>
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.species.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pet?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormOpen(true);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: ({ original }: { original: Pet }) => (
        <div className="font-medium text-slate-900">{original.name}</div>
      ),
    },
    {
      header: "Species",
      accessorKey: "species" as const,
    },
    {
      header: "Breed",
      accessorKey: "breed" as const,
      cell: ({ original }: { original: Pet }) => original.breed || "-",
    },
    {
      header: "Gender",
      accessorKey: "gender" as const,
      cell: ({ original }: { original: Pet }) => original.gender || "-",
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Pet }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pets/${original.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(original)}
          >
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
  ];

  if (isLoading) {
    return <div className="text-slate-500">Loading pets...</div>;
  }

  if (error) {
    return <div className="text-danger-500">Error loading pets</div>;
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
        <Button
          onClick={() => {
            setEditingPet(null);
            setFormOpen(true);
          }}
        >
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
              <Button
                onClick={() => {
                  setEditingPet(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Pet
              </Button>
            }
          />
        }
      />

      <PetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          if (editingPet) {
            await updateMutation.mutateAsync({
              id: editingPet.id,
              input: {
                ...data,
                customer_id: data.customer_id || editingPet.customer_id,
              },
            });
            return;
          }

          await createMutation.mutateAsync({
            ...data,
            customer_id: data.customer_id,
            gender: data.gender || undefined,
            birth_date: data.birth_date || undefined,
            microchip_number: data.microchip_number || undefined,
          });
        }}
        customers={customers?.map((c) => ({ id: c.id, name: c.name })) || []}
        initialData={
          editingPet
            ? {
                id: editingPet.id,
                customer_id: editingPet.customer_id,
                name: editingPet.name,
                species: editingPet.species,
                breed: editingPet.breed || undefined,
                birth_date: editingPet.birth_date || undefined,
                gender: editingPet.gender || undefined,
                microchip_number: editingPet.microchip_number || undefined,
              }
            : undefined
        }
      />
    </div>
  );
}
