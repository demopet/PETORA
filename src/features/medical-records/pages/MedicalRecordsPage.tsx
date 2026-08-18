import { useState } from "react";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMedicalRecords } from "../hooks/use-medical-records";
import { useDeleteMedicalRecord } from "../hooks/use-medical-records";
import type { MedicalRecord } from "@/types/medical-record";

export default function MedicalRecordsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: records, isLoading, error } = useMedicalRecords();
  const deleteMutation = useDeleteMedicalRecord();

  const filteredRecords = records?.filter(
    (record) =>
      record.record_number.toLowerCase().includes(search.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const columns = [
    {
      header: "Record #",
      accessorKey: "record_number" as const,
      cell: ({ original }: { original: MedicalRecord }) => (
        <div className="font-medium text-slate-900">
          {original.record_number}
        </div>
      ),
    },
    {
      header: "Diagnosis",
      accessorKey: "diagnosis" as const,
      cell: ({ original }: { original: MedicalRecord }) =>
        original.diagnosis || "-",
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: MedicalRecord }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: MedicalRecord }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/medical-records/${original.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
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
    return <div className="text-slate-500">Loading medical records...</div>;
  }

  if (error) {
    return <div className="text-danger-500">Error loading medical records</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredRecords?.length || 0} records
          </p>
        </div>
        <Button onClick={() => navigate("/medical-records/new")}>
          <Plus className="h-4 w-4" />
          New Record
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords || []}
        searchKey="record_number"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No medical records found"
            description="Get started by creating your first medical record."
            action={
              <Button onClick={() => navigate("/medical-records/new")}>
                <Plus className="h-4 w-4" />
                New Record
              </Button>
            }
          />
        }
      />
    </div>
  );
}
