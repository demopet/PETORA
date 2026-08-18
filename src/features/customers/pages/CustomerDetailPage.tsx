import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers } from "../hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import type { Pet } from "@/types/pet";

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const { data: customers } = useCustomers();
  const customer = customers?.find((c) => c.id === customerId);

  const { data: pets = [] } = usePets(customerId);

  if (!customerId) {
    return (
      <div className="space-y-6">
        <div className="text-danger-500">Customer ID not found</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/customers")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-danger-500">Customer not found</div>
      </div>
    );
  }

  const petColumns = [
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
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Pet }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/pets/${original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const tagColors: Record<string, string> = {
    VIP: "bg-purple-100 text-purple-700",
    REGULAR: "bg-blue-100 text-blue-700",
    NEW: "bg-green-100 text-green-700",
    BLACKLIST: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/customers")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${tagColors[tag] || "bg-gray-100 text-gray-700"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <StatusBadge status={customer.is_active ? "ACTIVE" : "ARCHIVED"} />
      </div>

      {/* Contact Info Card */}
      <div className="grid grid-cols-1 gap-6 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">
            Basic Information
          </p>
          <div className="mt-4 space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a
                  href={`tel:${customer.phone}`}
                  className="text-slate-900 hover:text-primary-600"
                >
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-slate-900 hover:text-primary-600"
                >
                  {customer.email}
                </a>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <p className="text-slate-900">{customer.address}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">
            Additional Information
          </p>
          <div className="mt-4 space-y-4">
            {customer.emergency_contact && (
              <div>
                <p className="text-xs text-slate-500">Emergency Contact</p>
                <p className="text-slate-900">{customer.emergency_contact}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500">Customer Type</p>
              <p className="text-slate-900">
                {customer.is_guest ? "Guest" : "Registered"}
              </p>
            </div>
            {customer.notes && (
              <div>
                <p className="text-xs text-slate-500">Notes</p>
                <p className="text-slate-900">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pets Section */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pets</h2>
          <Button
            size="sm"
            onClick={() => navigate(`/pets?customerId=${customerId}`)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </Button>
        </div>

        {pets.length > 0 ? (
          <DataTable
            columns={petColumns}
            data={pets}
            searchKey="name"
            emptyState={<div>No pets found</div>}
          />
        ) : (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-slate-500">
              No pets registered for this customer
            </p>
          </div>
        )}
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Pets</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {pets.length}
          </p>
        </div>
      </div>
    </div>
  );
}
