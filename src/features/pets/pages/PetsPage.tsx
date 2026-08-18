import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit, Eye, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { PetForm } from "../components/PetForm";
import { usePets, useCreatePet, useUpdatePet, useDeletePet } from "../hooks/use-pets";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Pet } from "@/types/pet";

interface PetsPageProps {
  customerId?: string;
}

const ITEMS_PER_PAGE = 12;

export default function PetsPage({ customerId }: PetsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState(customerId || "all");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const { data: pets, isLoading, error } = usePets(customerId);
  const { data: customers } = useCustomers();
  const createMutation = useCreatePet({ callerUserId: user?.id });
  const updateMutation = useUpdatePet({ callerUserId: user?.id });
  const deleteMutation = useDeletePet({ callerUserId: user?.id });

  const speciesOptions = useMemo(() => {
    const species = new Set<string>();
    pets?.forEach((pet) => species.add(pet.species));
    return Array.from(species).sort();
  }, [pets]);

  const filteredPets = useMemo(() => {
    let result = pets || [];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (pet) =>
          pet.name.toLowerCase().includes(query) ||
          pet.species.toLowerCase().includes(query) ||
          pet.breed?.toLowerCase().includes(query)
      );
    }

    if (customerFilter !== "all") {
      result = result.filter((pet) => pet.customer_id === customerFilter);
    }

    if (speciesFilter !== "all") {
      result = result.filter((pet) => pet.species === speciesFilter);
    }

    return result;
  }, [pets, search, customerFilter, speciesFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPets.length / ITEMS_PER_PAGE));
  const paginatedPets = filteredPets.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useMemo(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
          <Button variant="ghost" size="icon" onClick={() => handleEdit(original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(original.id)}>
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
          <p className="mt-1 text-sm text-slate-500">{filteredPets.length} pets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-100 p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
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
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search pets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={customerFilter}
          onValueChange={(value) => {
            setCustomerFilter(value);
            setPage(1);
          }}
          className="w-48"
          disabled={!!customerId}
        >
          <SelectOption value="all">All Customers</SelectOption>
          {customers?.map((customer) => (
            <SelectOption key={customer.id} value={customer.id}>
              {customer.name}
            </SelectOption>
          ))}
        </Select>
        <Select
          value={speciesFilter}
          onValueChange={(value) => {
            setSpeciesFilter(value);
            setPage(1);
          }}
          className="w-40"
        >
          <SelectOption value="all">All Species</SelectOption>
          {speciesOptions.map((species) => (
            <SelectOption key={species} value={species}>
              {species}
            </SelectOption>
          ))}
        </Select>
      </div>

      {viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={paginatedPets}
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedPets.map((pet) => (
            <div key={pet.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{pet.name}</h3>
                  <p className="text-sm text-slate-500">{pet.species}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/pets/${pet.id}`)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pet.id)}>
                    <Trash2 className="h-4 w-4 text-danger-500" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                {pet.breed && <p>Breed: {pet.breed}</p>}
                {pet.gender && <p>Gender: {pet.gender}</p>}
                {pet.birth_date && <p>Born: {new Date(pet.birth_date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

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
