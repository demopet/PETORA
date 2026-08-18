import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useExpenses } from "../hooks/use-expenses";
import { useApproveExpense } from "../hooks/use-expenses";
import { useRejectExpense } from "../hooks/use-expenses";
import type { Expense } from "@/types/expense";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: expenses, isLoading, error } = useExpenses();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const filteredExpenses = expenses?.filter((expense) =>
    expense.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync({ id, callerUserId: user?.id || "" });
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this expense?")) {
      await rejectMutation.mutateAsync({ id, callerUserId: user?.id || "" });
    }
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "expense_date" as const,
    },
    {
      header: "Description",
      accessorKey: "description" as const,
      cell: ({ original }: { original: Expense }) => original.description || "-",
    },
    {
      header: "Amount",
      accessorKey: "amount" as const,
      cell: ({ original }: { original: Expense }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.amount)}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: Expense }) => <StatusBadge status={original.status} />,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Expense }) => (
        <div className="flex items-center gap-2">
          {original.status === "PENDING" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleApprove(original.id)}>
                Approve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleReject(original.id)}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-slate-500">Loading expenses...</div>;
  }

  if (error) {
    return <div className="text-danger-500">Error loading expenses</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredExpenses?.length || 0} expenses</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses || []}
        searchKey="description"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No expenses found"
            description="Get started by adding your first expense."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            }
          />
        }
      />
    </div>
  );
}
