import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomDashboard } from "../components/RoomDashboard";
import { usePetHotelBookings } from "../hooks/use-pet-hotel";
import {
  useCheckInBooking,
  useCheckOutBooking,
  useAddPetHotelLog,
  useCancelPetHotelBooking,
} from "../hooks/use-pet-hotel";
import type { PetHotelBooking } from "@/types/pet-hotel";

type ViewMode = "list" | "dashboard";

export default function PetHotelPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data: bookings, isLoading, error } = usePetHotelBookings();
  const checkInMutation = useCheckInBooking();
  const checkOutMutation = useCheckOutBooking();
  const addLogMutation = useAddPetHotelLog();
  const cancelMutation = useCancelPetHotelBooking();

  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer_id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCheckIn = async (id: string) => {
    try {
      await checkInMutation.mutateAsync(id);
    } catch (err) {
      console.error("Check-in failed:", err);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutMutation.mutateAsync(id);
    } catch (err) {
      console.error("Check-out failed:", err);
    }
  };

  const handleAddLog = async (bookingId: string) => {
    const description = prompt("Enter log description:");
    if (!description) return;

    const logType = prompt(
      "Enter log type (FEEDING, MEDICINE, NOTE):",
    )?.toUpperCase();
    if (!logType || !["FEEDING", "MEDICINE", "NOTE"].includes(logType)) {
      alert("Invalid log type. Use FEEDING, MEDICINE, or NOTE.");
      return;
    }

    try {
      await addLogMutation.mutateAsync({
        booking_id: bookingId,
        log_type: logType as "FEEDING" | "MEDICINE" | "NOTE",
        description,
      });
    } catch (err) {
      console.error("Add log failed:", err);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const columns = [
    {
      header: "Booking #",
      accessorKey: "booking_number" as const,
      cell: ({ original }: { original: PetHotelBooking }) => (
        <div className="font-medium text-slate-900">
          {original.booking_number}
        </div>
      ),
    },
    {
      header: "Check In",
      accessorKey: "check_in_date" as const,
    },
    {
      header: "Check Out",
      accessorKey: "check_out_date" as const,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: PetHotelBooking }) => (
        <StatusBadge status={original.status} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: PetHotelBooking }) => (
        <div className="flex items-center gap-2">
          {original.status === "BOOKED" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCheckIn(original.id)}
              title="Check In"
            >
              <CheckCircle className="h-4 w-4 text-success-600" />
            </Button>
          )}
          {original.status === "CHECKED_IN" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCheckOut(original.id)}
                title="Check Out"
              >
                <XCircle className="h-4 w-4 text-info-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAddLog(original.id)}
                title="Add Log"
              >
                <FileText className="h-4 w-4 text-warning-600" />
              </Button>
            </>
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
    return <div className="text-slate-500">Loading pet hotel bookings...</div>;
  }

  if (error) {
    return (
      <div className="text-danger-500">Error loading pet hotel bookings</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pet Hotel</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredBookings?.length || 0} bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "dashboard" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("dashboard")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {viewMode === "dashboard" ? (
        <RoomDashboard />
      ) : (
        <>
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
          </div>

          <DataTable
            columns={columns}
            data={filteredBookings || []}
            searchKey="booking_number"
            emptyState={
              <EmptyState
                icon={<Plus className="h-12 w-12" />}
                title="No bookings found"
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
        </>
      )}
    </div>
  );
}
