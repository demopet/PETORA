import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
} from "../hooks/use-appointments";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import type { AppointmentStatus } from "@/types/appointment";

const statusColors: Record<AppointmentStatus, string> = {
  WAITING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const {
    data: appointment,
    isLoading,
    error,
  } = useAppointment(appointmentId || "");
  const updateStatusMutation = useUpdateAppointmentStatus();
  const cancelMutation = useCancelAppointment();
  const { data: customers } = useCustomers();
  const { data: pets } = usePets();

  if (!appointmentId) {
    return (
      <div className="space-y-6">
        <div className="text-danger-500">Appointment ID not found</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/appointments")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-danger-500">Error loading appointment</div>
      </div>
    );
  }

  const customer = customers?.find((c) => c.id === appointment.customer_id);
  const pet = pets?.find((p) => p.id === appointment.pet_id);

  const availableTransitions: AppointmentStatus[] = [];
  if (appointment.status === "WAITING") {
    availableTransitions.push("IN_PROGRESS", "CANCELLED");
  }
  if (appointment.status === "IN_PROGRESS") {
    availableTransitions.push("DONE", "CANCELLED");
  }

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        id: appointment.id,
        status: newStatus,
      });

      if (result.promptCreateMedicalRecord) {
        navigate(`/medical-records/new?appointmentId=${appointment.id}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      await cancelMutation.mutateAsync(appointment.id);
      navigate("/appointments");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/appointments")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            Appointment Detail
          </h1>
          <p className="mt-2 text-slate-600">
            {appointment.appointment_date} at {appointment.appointment_time}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">
            Customer
          </p>
          <div className="mt-4">
            <p className="text-lg font-semibold text-slate-900">
              {customer?.name || "Unknown"}
            </p>
            {customer?.phone && (
              <p className="mt-1 text-sm text-slate-600">{customer.phone}</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">Pet</p>
          <div className="mt-4">
            <p className="text-lg font-semibold text-slate-900">
              {pet?.name || "Unknown"} ({pet?.species})
            </p>
            {pet?.breed && (
              <p className="mt-1 text-sm text-slate-600">{pet.breed}</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">
            Queue Number
          </p>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            {appointment.queue_number || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">Status</p>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusColors[appointment.status]}`}
            >
              <div className="h-2 w-2 rounded-full bg-current" />
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {(appointment.complaint || appointment.notes) && (
        <div className="space-y-4 rounded-lg bg-slate-50 p-6">
          {appointment.complaint && (
            <div>
              <p className="text-sm font-medium text-slate-700">Complaint</p>
              <p className="mt-2 text-slate-900">{appointment.complaint}</p>
            </div>
          )}
          {appointment.notes && (
            <div>
              <p className="text-sm font-medium text-slate-700">Notes</p>
              <p className="mt-2 text-slate-900">{appointment.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 rounded-lg bg-blue-50 p-6">
        <p className="text-sm font-semibold text-blue-900">Actions</p>
        <div className="flex flex-wrap gap-3">
          {availableTransitions.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updateStatusMutation.isPending}
              variant={status === "CANCELLED" ? "outline" : "default"}
            >
              {status === "IN_PROGRESS" && "Start Appointment"}
              {status === "DONE" && "Complete Appointment"}
              {status === "CANCELLED" && "Cancel"}
            </Button>
          ))}

          {availableTransitions.length === 0 &&
            appointment.status !== "CANCELLED" && (
              <div>
                <Button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  variant="outline"
                >
                  Cancel Appointment
                </Button>
              </div>
            )}
        </div>
      </div>

      {appointment.status === "DONE" && (
        <div className="flex gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">
              Appointment completed
            </p>
            <p className="mt-1 text-sm text-green-800">
              Create a medical record to document the visit.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              navigate(`/medical-records/new?appointmentId=${appointment.id}`)
            }
          >
            Create Medical Record
          </Button>
        </div>
      )}
    </div>
  );
}
