import { useState } from "react";
import { Plus, Search, Trash2, Play, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGroomingBookings,
  useGroomingServices,
} from "../hooks/use-grooming";
import {
  useStartGrooming,
  useFinishGrooming,
  useCancelGroomingBooking,
} from "../hooks/use-grooming";
import type { GroomingBooking, GroomingService } from "@/types/grooming";

type GroomingStatus = "BOOKED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

const STATUS_STEPS: GroomingStatus[] = ["BOOKED", "IN_PROGRESS", "DONE"];

export default function GroomingPage() {
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const { data: bookings, isLoading, error } = useGroomingBookings();
  const { data: services } = useGroomingServices();
  const startMutation = useStartGrooming();
  const finishMutation = useFinishGrooming();
  const cancelMutation = useCancelGroomingBooking();

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer_id.toLowerCase().includes(search.toLowerCase());
    const matchesService =
      selectedService === "all" || booking.service_id === selectedService;
    return matchesSearch && matchesService;
  });

  const handleStart = async (id: string) => {
    try {
      await startMutation.mutateAsync(id);
    } catch (err) {
      console.error("Start grooming failed:", err);
    }
  };

  const handleFinish = async (id: string) => {
    const skinCondition = prompt("Skin condition (optional):") || undefined;
    const recommendations = prompt("Recommendations (optional):") || undefined;
    const fleaTickInput = prompt("Flea/tick found? (y/n):")?.toLowerCase();
    const fleaTickFound = fleaTickInput === "y";

    try {
      await finishMutation.mutateAsync({
        bookingId: id,
        input: {
          booking_id: id,
          skin_condition: skinCondition,
          flea_tick_found: fleaTickFound,
          recommendations: recommendations,
        },
      });
    } catch (err) {
      console.error("Finish grooming failed:", err);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      await cancelMutation.mutateAsync(id);
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
        <div className="font-medium text-slate-900">
          {original.booking_number}
        </div>
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
                  index <= getStatusStepIndex(original.status)
                    ? "bg-primary-500"
                    : "bg-slate-200"
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
              onClick={() => handleFinish(original.id)}
              title="Finish Grooming"
            >
              <CheckCircle className="h-4 w-4 text-success-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCancel(original.id)}
          >
            <Trash2 className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-slate-500">Loading grooming bookings...</div>;
  }

  if (error) {
    return (
      <div className="text-danger-500">Error loading grooming bookings</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grooming</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredBookings?.length || 0} bookings
          </p>
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
    </div>
  );
}
