import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCashShifts } from "../hooks/use-cash-shifts";
import type { CashShift } from "@/types/invoice";

export default function CashShiftsPage() {
  const [search, setSearch] = useState("");
  const { data: shifts, isLoading, error } = useCashShifts();

  const filteredShifts = shifts?.filter((shift) =>
    shift.id.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      header: "Open Time",
      accessorKey: "open_time" as const,
      cell: ({ original }: { original: CashShift }) => (
        <div className="text-sm">
          {new Date(original.open_time).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      header: "Close Time",
      accessorKey: "close_time" as const,
      cell: ({ original }: { original: CashShift }) =>
        original.close_time
          ? new Date(original.close_time).toLocaleString("id-ID")
          : "-",
    },
    {
      header: "Opening Cash",
      accessorKey: "opening_cash" as const,
      cell: ({ original }: { original: CashShift }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.opening_cash)}
        </div>
      ),
    },
    {
      header: "Closing Cash",
      accessorKey: "closing_cash" as const,
      cell: ({ original }: { original: CashShift }) =>
        original.closing_cash !== null ? (
          <div className="font-medium">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(original.closing_cash)}
          </div>
        ) : (
          "-"
        ),
    },
    {
      header: "Difference",
      accessorKey: "difference" as const,
      cell: ({ original }: { original: CashShift }) =>
        original.difference !== null ? (
          <div
            className={`font-medium ${original.difference >= 0 ? "text-success-600" : "text-danger-600"}`}
          >
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(original.difference)}
          </div>
        ) : (
          "-"
        ),
    },
  ];

  if (isLoading) {
    return <div className="text-slate-500">Loading cash shifts...</div>;
  }

  if (error) {
    return <div className="text-danger-500">Error loading cash shifts</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Shifts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredShifts?.length || 0} shifts
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Open Shift
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredShifts || []}
        searchKey="id"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No cash shifts found"
            description="Get started by opening a new cash shift."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                Open Shift
              </Button>
            }
          />
        }
      />
    </div>
  );
}
