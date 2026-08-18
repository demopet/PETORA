import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit, Eye, UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { CustomerForm } from "../components/CustomerForm";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useConvertGuest,
} from "../hooks/use-customers";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Customer, CustomerTag } from "@/types/customer";
import { toast } from "sonner";
import { CUSTOMER_TAG_OPTIONS } from "@/lib/utils/constants";

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertingCustomer, setConvertingCustomer] = useState<Customer | null>(null);
  const [convertUsername, setConvertUsername] = useState("");
  const [convertPin, setConvertPin] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const { data: customers, isLoading, error } = useCustomers();
  const createMutation = useCreateCustomer({ callerUserId: user?.id });
  const updateMutation = useUpdateCustomer({ callerUserId: user?.id });
  const deleteMutation = useDeleteCustomer({ callerUserId: user?.id });
  const convertMutation = useConvertGuest({ callerUserId: user?.id });

  const TAG_OPTIONS = [{ value: "all", label: "All Tags" }, ...CUSTOMER_TAG_OPTIONS];

  const filteredCustomers = useMemo(() => {
    let result = customers || [];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query)
      );
    }

    if (tagFilter !== "all") {
      result = result.filter((customer) => customer.tags.includes(tagFilter as CustomerTag));
    }

    return result;
  }, [customers, search, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useMemo(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await deleteMutation.mutateAsync(deletingCustomer.id);
      toast.success("Customer deleted successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete customer");
    } finally {
      setDeleteOpen(false);
      setDeletingCustomer(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleConvertClick = (customer: Customer) => {
    setConvertingCustomer(customer);
    setConvertUsername("");
    setConvertPin("");
    setConvertOpen(true);
  };

  const handleConvertSubmit = async () => {
    if (!convertingCustomer) return;
    if (!convertUsername && !convertPin) {
      toast.error("Please provide both username and PIN to create an account.");
      return;
    }
    if (convertUsername && !convertPin) {
      toast.error("Please provide a PIN.");
      return;
    }
    if (!convertUsername && convertPin) {
      toast.error("Please provide a username.");
      return;
    }
    try {
      await convertMutation.mutateAsync({
        customerId: convertingCustomer.id,
        username: convertUsername,
        pin: convertPin,
      });
      toast.success("Customer converted to registered successfully.");
      setConvertOpen(false);
      setConvertingCustomer(null);
      setConvertUsername("");
      setConvertPin("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to convert customer");
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: ({ original }: { original: Customer }) => (
        <div>
          <div className="font-medium text-slate-900">{original.name}</div>
          <div className="text-sm text-slate-500">{original.phone}</div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email" as const,
      cell: ({ original }: { original: Customer }) => original.email || "-",
    },
    {
      header: "Status",
      accessorKey: "is_active" as const,
      cell: ({ original }: { original: Customer }) => (
        <StatusBadge status={original.is_active ? "ACTIVE" : "ARCHIVED"} />
      ),
    },
    {
      header: "Type",
      accessorKey: "is_guest" as const,
      cell: ({ original }: { original: Customer }) => (
        <StatusBadge status={original.is_guest ? "GUEST" : "REGISTERED"} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Customer }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/customers/${original.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {original.is_guest && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleConvertClick(original)}
              title="Convert to Registered"
            >
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(original)}>
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
        <p className="text-lg font-medium">Failed to load customers</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredCustomers.length} customers</p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={tagFilter}
          onValueChange={(value) => {
            setTagFilter(value);
            setPage(1);
          }}
          className="w-40"
        >
          {TAG_OPTIONS.map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={paginatedCustomers}
        searchKey="name"
        emptyState={
          <EmptyState
            icon={<UserPlus className="h-12 w-12" />}
            title="No customers found"
            description="Get started by adding your first customer."
            action={
              <Button
                onClick={() => {
                  setEditingCustomer(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            }
          />
        }
      />

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

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          if (editingCustomer) {
            await updateMutation.mutateAsync({
              id: editingCustomer.id,
              input: {
                ...data,
                tags: data.tags ?? editingCustomer.tags,
                is_guest: data.is_guest ?? editingCustomer.is_guest,
              },
            });
            return;
          }

          await createMutation.mutateAsync({
            ...data,
            tags: data.tags ?? [],
            is_guest: data.is_guest ?? false,
          });
        }}
        initialData={
          editingCustomer
            ? {
                name: editingCustomer.name,
                phone: editingCustomer.phone ?? undefined,
                email: editingCustomer.email ?? undefined,
                address: editingCustomer.address ?? undefined,
                emergency_contact: editingCustomer.emergency_contact ?? undefined,
                notes: editingCustomer.notes ?? undefined,
                is_guest: editingCustomer.is_guest,
                tags: editingCustomer.tags,
              }
            : undefined
        }
      />

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Registered Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Converting <strong>{convertingCustomer?.name}</strong> from guest to registered. You
              can optionally create a user account for them.
            </p>
            <FormField label="Username (optional)">
              <Input
                value={convertUsername}
                onChange={(e) => setConvertUsername(e.target.value)}
                placeholder="Enter username for new account"
              />
            </FormField>
            <FormField label="PIN (8 digits, optional)">
              <Input
                type="password"
                value={convertPin}
                onChange={(e) => setConvertPin(e.target.value)}
                placeholder="Enter 8-digit PIN"
                maxLength={6}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertSubmit}>Convert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deletingCustomer?.name || "this customer"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
