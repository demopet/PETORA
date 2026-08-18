import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ProductForm } from "../components/ProductForm";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useArchiveProduct,
} from "../hooks/use-products";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { data: products, isLoading, error } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return data as Array<{ id: string; name: string }>;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return data as Array<{ id: string; name: string }>;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!search) return products;
    const query = search.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
    );
  }, [products, search]);

  const handleArchiveClick = (product: Product) => {
    setDeletingProduct(product);
    setDeleteOpen(true);
  };

  const handleArchive = async () => {
    if (!deletingProduct) return;
    try {
      await archiveMutation.mutateAsync(deletingProduct.id);
      toast.success("Product archived successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive product");
    } finally {
      setDeleteOpen(false);
      setDeletingProduct(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: ({ original }: { original: Product }) => (
        <div>
          <div className="font-medium text-slate-900">{original.name}</div>
          <div className="text-sm text-slate-500">SKU: {original.sku}</div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category_id" as const,
      cell: ({ original }: { original: Product }) => original.category_id || "-",
    },
    {
      header: "Price",
      accessorKey: "selling_price" as const,
      cell: ({ original }: { original: Product }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.selling_price)}
        </div>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stock_quantity" as const,
      cell: ({ original }: { original: Product }) => (
        <div
          className={
            original.stock_quantity <= original.stock_minimum ? "text-danger-600 font-medium" : ""
          }
        >
          {original.stock_quantity}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: Product }) => <StatusBadge status={original.status} />,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Product }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleArchiveClick(original)}>
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
        <p className="text-lg font-medium">Failed to load products</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredProducts?.length || 0} products</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts || []}
        searchKey="name"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No products found"
            description="Get started by adding your first product."
            action={
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            }
          />
        }
      />

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          if (editingProduct) {
            await updateMutation.mutateAsync({
              id: editingProduct.id,
              input: {
                ...data,
                category_id: data.category_id || undefined,
                supplier_id: data.supplier_id || undefined,
              },
            });
            return;
          }

          await createMutation.mutateAsync({
            ...data,
            category_id: data.category_id || undefined,
            supplier_id: data.supplier_id || undefined,
            barcode: data.barcode || undefined,
            description: data.description || undefined,
            expiry_date: data.expiry_date || undefined,
          });
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        initialData={
          editingProduct
            ? {
                id: editingProduct.id,
                sku: editingProduct.sku,
                name: editingProduct.name,
                category_id: editingProduct.category_id || undefined,
                supplier_id: editingProduct.supplier_id || undefined,
                barcode: editingProduct.barcode || undefined,
                description: editingProduct.description || undefined,
                purchase_price: editingProduct.purchase_price,
                selling_price: editingProduct.selling_price,
                stock_quantity: editingProduct.stock_quantity,
                stock_minimum: editingProduct.stock_minimum,
                stock_maximum: editingProduct.stock_maximum,
                expiry_date: editingProduct.expiry_date || undefined,
              }
            : undefined
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Archive Product"
        description={`Are you sure you want to archive ${deletingProduct?.name || "this product"}? This action cannot be undone.`}
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleArchive}
      />
    </div>
  );
}
