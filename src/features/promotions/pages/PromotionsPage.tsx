import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePromotions } from "../hooks/use-promotions";
import { useCancelPromotion } from "../hooks/use-promotions";
import type { Promotion } from "@/types/promotion";

export default function PromotionsPage() {
  const [search, setSearch] = useState("");
  const { data: promotions, isLoading, error } = usePromotions();
  const cancelMutation = useCancelPromotion();

  const filteredPromotions = promotions?.filter(
    (promo) =>
      promo.name.toLowerCase().includes(search.toLowerCase()) ||
      promo.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this promotion?")) {
      await cancelMutation.mutateAsync({ id, callerUserId: "" });
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: ({ original }: { original: Promotion }) => (
        <div>
          <div className="font-medium text-slate-900">{original.name}</div>
          <div className="text-sm text-slate-500">Code: {original.code || "N/A"}</div>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "promotion_type" as const,
    },
    {
      header: "Discount",
      accessorKey: "discount_value" as const,
      cell: ({ original }: { original: Promotion }) => (
        <div className="font-medium">
          {original.promotion_type === "PERCENTAGE"
            ? `${original.discount_value}%`
            : new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(original.discount_value)}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: Promotion }) => <StatusBadge status={original.status} />,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Promotion }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleArchive(original.id)}>
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
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
        <p className="text-lg font-medium">Failed to load promotions</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPromotions?.length || 0} promotions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search promotions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPromotions || []}
        searchKey="name"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No promotions found"
            description="Get started by creating your first promotion."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                New Promotion
              </Button>
            }
          />
        }
      />
    </div>
  );
}
