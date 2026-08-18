import { useState } from "react";
import { Plus, Search, Trash2, Play, CheckCircle } from "lucide-react";
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
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useGroomingBookings, useGroomingServices } from "../hooks/use-grooming";
import {
  useStartGrooming,
  useFinishGrooming,
  useCancelGroomingBooking,
} from "../hooks/use-grooming";
import type { GroomingBooking, GroomingService } from "@/types/grooming";
import { toast } from "sonner";

type GroomingStatus = "BOOKED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

const STATUS_STEPS: GroomingStatus[] = ["BOOKED", "IN_PROGRESS", "DONE"];

export default function GroomingPage() {
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishingBookingId, setFinishingBookingId] = useState<string | null>(null);
  const [finishData, setFinishData] = useState({
    skin_condition: "",
    recommendations: "",
    flea_tick_found: false,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const { data: bookings, isLoading, error } = useGroomingBookings();
  const { data: services } = useGroomingServices();
  const startMutation = useStartGrooming();
  const finishMutation = useFinishGrooming();
  const cancelMutation = useCancelGroomingBooking();

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer_id.toLowerCase().includes(search.toLowerCase());
    const matchesService = selectedService === "all" || booking.service_id === selectedService;
    return matchesSearch && matchesService;
  });

  const handleStart = async (id: string) => {
    try {
      await startMutation.mutateAsync(id);
      toast.success("Grooming started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start grooming");
    }
  };

  const handleFinishClick = (id: string) => {
    setFinishingBookingId(id);
    setFinishData({ skin_condition: "", recommendations: "", flea_tick_found: false });
    setFinishOpen(true);
  };

  const handleFinish = async () => {
    if (!finishingBookingId) return;
    try {
      await finishMutation.mutateAsync({
        bookingId: finishingBookingId,
        input: {
          booking_id: finishingBookingId,
          skin_condition: finishData.skin_condition || undefined,
          flea_tick_found: finishData.flea_tick_found,
          recommendations: finishData.recommendations || undefined,
        },
      });
      toast.success("Grooming completed successfully");
      setFinishOpen(false);
      setFinishingBookingId(null);
      setFinishData({ skin_condition: "", recommendations: "", flea_tick_found: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to finish grooming");
    }
  };

  const handleCancelClick = (id: string) => {
    setDeletingBookingId(id);
    setDeleteOpen(true);
  };

  const handleCancel = async () => {
    if (!deletingBookingId) return;
    try {
      await cancelMutation.mutateAsync(deletingBookingId);
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setDeleteOpen(false);
      setDeletingBookingId(null);
    }
  };

  const getStatusStepIndex = (status: string) => {
    return STATUS_STEPS.indexOf(status as GroomingStatus);
  };

  const columns = [
    {
      header: "Booking #",
      accessorKey: "booking_number" as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <div className="font-medium text-slate-900">{original.booking_number}</div>
      ),
    },
    {
      header: "Date",
      accessorKey: "appointment_date" as const,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <div className="space-y-1">
          <StatusBadge status={original.status} />
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, index) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  index <= getStatusStepIndex(original.status) ? "bg-primary-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: GroomingBooking }) => (
        <div className="flex items-center gap-2">
          {original.status === "BOOKED" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStart(original.id)}
              title="Start Grooming"
            >
              <Play className="h-4 w-4 text-success-600" />
            </Button>
          )}
          {original.status === "IN_PROGRESS" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFinishClick(original.id)}
              title="Finish Grooming"
            >
              <CheckCircle className="h-4 w-4 text-success-600" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleCancelClick(original.id)}>
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
        <p className="text-lg font-medium">Failed to load grooming bookings</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grooming</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredBookings?.length || 0} bookings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-48">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Services</option>
            {services?.map((service: GroomingService) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBookings || []}
        searchKey="booking_number"
        emptyState={
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No grooming bookings found"
            description="Get started by creating your first booking."
            action={
              <Button>
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            }
          />
        }
      />

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Grooming</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField label="Skin Condition (optional)">
              <Input
                value={finishData.skin_condition}
                onChange={(e) => setFinishData({ ...finishData, skin_condition: e.target.value })}
                placeholder="e.g., Healthy, Dry skin, Irritation"
              />
            </FormField>
            <FormField label="Recommendations (optional)">
              <Textarea
                value={finishData.recommendations}
                onChange={(e) => setFinishData({ ...finishData, recommendations: e.target.value })}
                placeholder="Care recommendations for the pet owner"
                rows={3}
              />
            </FormField>
            <div className="flex items-center gap-2">
              <input
                id="flea-tick"
                type="checkbox"
                checked={finishData.flea_tick_found}
                onChange={(e) =>
                  setFinishData({ ...finishData, flea_tick_found: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="flea-tick" className="text-sm text-slate-700">
                Flea / tick found
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinish}>Complete Grooming</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this grooming booking? This action cannot be undone."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
