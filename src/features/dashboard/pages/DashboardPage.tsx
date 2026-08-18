import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { LOW_STOCK_THRESHOLD, DASHBOARD_CHART_DAYS } from "@/lib/utils/constants";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/data-display/timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, PawPrint, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Appointment } from "@/types/appointment";
import type { Invoice } from "@/types/invoice";
import type { Product } from "@/types/product";

export default function DashboardPage() {
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").is("deleted_at", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pets").select("*").is("deleted_at", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_date", new Date().toISOString().split("T")[0]);
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("status", "PAID");
      if (error) throw error;
      return data;
    },
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .order("stock", { ascending: true });
      if (error) throw error;
      return data as Product[] | null;
    },
  });

  const recentAppointments = appointments?.slice(0, 5) || [];

  const appointmentColumns = [
    {
      header: "Customer",
      accessorKey: "customer_id" as const,
      cell: ({ original }: { original: Appointment }) => (
        <div className="font-medium text-slate-900">{original.customer_id}</div>
      ),
    },
    {
      header: "Time",
      accessorKey: "appointment_time" as const,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: Appointment }) => <StatusBadge status={original.status} />,
    },
  ];

  const totalRevenue =
    invoices?.reduce((sum: number, inv: Invoice) => sum + inv.total_amount, 0) || 0;

  const activityItems =
    appointments?.slice(0, 3).map((a) => ({
      date: a.appointment_date,
      title: `Appointment ${a.status}`,
      description: `Customer: ${a.customer_id} at ${a.appointment_time}`,
    })) || [];

  const chartData =
    invoices?.slice(0, DASHBOARD_CHART_DAYS).map((inv) => ({
      date: new Date(inv.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      revenue: inv.total_amount,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome to Petora</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Customers"
          value={String(customers?.length || 0)}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Pets"
          value={String(pets?.length || 0)}
          icon={<PawPrint className="h-6 w-6" />}
        />
        <StatCard
          title="Appointments Today"
          value={String(appointments?.length || 0)}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={appointmentColumns}
              data={recentAppointments}
              emptyState={
                <div className="py-8 text-center text-sm text-slate-500">No appointments today</div>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">SKU: {product.sku || product.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-danger-600">{product.stock} left</p>
                      <p className="text-xs text-slate-500">Min: {product.min_stock || 5}</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-slate-500">
                    +{lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                All products are well-stocked
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={activityItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
