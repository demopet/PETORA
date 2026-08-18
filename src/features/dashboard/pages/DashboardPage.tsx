import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, PawPrint, Calendar, DollarSign } from "lucide-react";
import type { Appointment } from "@/types/appointment";
import type { Invoice } from "@/types/invoice";

export default function DashboardPage() {
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .is("deleted_at", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .is("deleted_at", null);
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
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("status", "PAID");
      if (error) throw error;
      return data;
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
      cell: ({ original }: { original: Appointment }) => (
        <StatusBadge status={original.status} />
      ),
    },
  ];

  const totalRevenue =
    invoices?.reduce(
      (sum: number, inv: Invoice) => sum + inv.total_amount,
      0,
    ) || 0;

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
          value={totalRevenue.toLocaleString("id-ID")}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Today's Appointments
          </h2>
          <div className="mt-4">
            <DataTable
              columns={appointmentColumns}
              data={recentAppointments}
              emptyState={
                <div className="py-8 text-center text-sm text-slate-500">
                  No appointments today
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
