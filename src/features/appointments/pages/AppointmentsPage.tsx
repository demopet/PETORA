import { useState } from "react";
import { Plus, Search, Eye, Calendar, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCalendar } from "../components/AppointmentCalendar";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
} from "../hooks/use-appointments";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import { useUsers } from "@/features/users/hooks/use-users";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

type ViewMode = "list" | "calendar";

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptAppointment, setPromptAppointment] = useState<Appointment | null>(null);
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: customers } = useCustomers();
  const { data: pets } = usePets();
  const { data: users } = useUsers();
  const createAppointmentMutation = useCreateAppointment();
  const updateStatusMutation = useUpdateAppointmentStatus();

  const doctors = users?.filter((user) => user.role === "DOKTER") || [];

  const filteredAppointments = appointments?.filter(
    (apt) =>
      apt.complaint?.toLowerCase().includes(search.toLowerCase()) ||
      apt.customer_id.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Date",
      accessorKey: "appointment_date" as const,
    },
    {
      header: "Time",
      accessorKey: "appointment_time" as const,
    },
    {
      header: "Customer",
      accessorKey: "customer_id" as const,
      cell: ({ original }: { original: Appointment }) => (
        <div className="font-medium text-slate-900">{original.customer_id}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: Appointment }) => <StatusBadge status={original.status} />,
    },
    {
      header: "Queue",
      accessorKey: "queue_number" as const,
      cell: ({ original }: { original: Appointment }) => original.queue_number || "-",
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Appointment }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/appointments/${original.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {original.status === "WAITING" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(original.id, "IN_PROGRESS")}
              disabled={updateStatusMutation.isPending}
            >
              Start
            </Button>
          )}
          {original.status === "IN_PROGRESS" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange(original.id, "DONE")}
              disabled={updateStatusMutation.isPending}
            >
              Done
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const result = await updateStatusMutation.mutateAsync({ id, status });
      if (result.promptCreateMedicalRecord) {
        setPromptAppointment(result.appointment);
        setPromptOpen(true);
      }
    } catch {
      toast.error("Failed to update appointment status");
    }
  };

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
        <p className="text-lg font-medium">Failed to load appointments</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredAppointments?.length || 0} appointments
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <DataTable
          columns={columns}
          data={filteredAppointments || []}
          searchKey="appointment_date"
          emptyState={
            <EmptyState
              icon={<Plus className="h-12 w-12" />}
              title="No appointments found"
              description="Get started by creating your first appointment."
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New Appointment
                </Button>
              }
            />
          }
        />
      )}

      {viewMode === "calendar" && (
        <AppointmentCalendar
          appointments={appointments || []}
          onAppointmentClick={(apt) => navigate(`/appointments/${apt.id}`)}
        />
      )}

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          await createAppointmentMutation.mutateAsync({
            ...data,
            doctor_id: data.doctor_id || undefined,
            complaint: data.complaint || undefined,
            notes: data.notes || undefined,
            is_from_portal: false,
          });
        }}
        customers={customers?.map((c) => ({ id: c.id, name: c.name })) || []}
        pets={
          pets?.map((p) => ({
            id: p.id,
            name: p.name,
            customer_id: p.customer_id,
          })) || []
        }
        doctors={doctors.map((d) => ({ id: d.id, full_name: d.full_name }))}
      />

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Medical Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Appointment #{promptAppointment?.queue_number} has been marked as DONE. Would you like
            to create a medical record for this appointment?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromptOpen(false)}>
              Skip
            </Button>
            <Button
              onClick={() => {
                setPromptOpen(false);
                if (promptAppointment) {
                  navigate(`/medical-records/new?appointmentId=${promptAppointment.id}`);
                }
              }}
            >
              Create Medical Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
