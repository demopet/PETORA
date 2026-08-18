import { useState } from "react";
import { Search, Package } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useStockMovements } from "../hooks/use-inventory";
import type { StockMovement } from "@/types/product";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const { data: movements, isLoading, error } = useStockMovements();

  const filteredMovements = movements?.filter((movement) =>
    movement.reference_type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Type",
      accessorKey: "movement_type" as const,
    },
    {
      header: "Quantity",
      accessorKey: "quantity" as const,
      cell: ({ original }: { original: StockMovement }) => (
        <div
          className={`font-medium ${original.quantity > 0 ? "text-success-600" : "text-danger-600"}`}
        >
          {original.quantity > 0 ? "+" : ""}
          {original.quantity}
        </div>
      ),
    },
    {
      header: "Reference",
      accessorKey: "reference_type" as const,
      cell: ({ original }: { original: StockMovement }) => original.reference_type || "-",
    },
    {
      header: "Notes",
      accessorKey: "notes" as const,
      cell: ({ original }: { original: StockMovement }) => original.notes || "-",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-danger-500">
        <p className="text-lg font-medium">Failed to load inventory</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          {filteredMovements?.length || 0} stock movements
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search movements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredMovements || []}
        searchKey="reference_type"
        emptyState={
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No stock movements found"
            description="Stock movements will appear here when transactions occur."
          />
        }
      />
    </div>
  );
}
