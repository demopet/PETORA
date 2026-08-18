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
import { Select, SelectOption } from "@/components/ui/select";
import { RoomDashboard } from "../components/RoomDashboard";
import { usePetHotelBookings } from "../hooks/use-pet-hotel";
import {
  useCheckInBooking,
  useCheckOutBooking,
  useAddPetHotelLog,
  useCancelPetHotelBooking,
} from "../hooks/use-pet-hotel";
import type { PetHotelBooking } from "@/types/pet-hotel";
import { toast } from "sonner";
import { PET_HOTEL_LOG_TYPES } from "@/lib/utils/constants";

type ViewMode = "list" | "dashboard";

export default function PetHotelPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [logOpen, setLogOpen] = useState(false);
  const [logBookingId, setLogBookingId] = useState<string | null>(null);
  const [logType, setLogType] = useState("NOTE");
  const [logDescription, setLogDescription] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const { data: bookings, isLoading, error } = usePetHotelBookings();
  const checkInMutation = useCheckInBooking();
  const checkOutMutation = useCheckOutBooking();
  const addLogMutation = useAddPetHotelLog();
  const cancelMutation = useCancelPetHotelBooking();

  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = async (id: string) => {
    try {
      await checkInMutation.mutateAsync(id);
      toast.success("Check-in successful");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutMutation.mutateAsync(id);
      toast.success("Check-out successful");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    }
  };

  const handleAddLogClick = (bookingId: string) => {
    setLogBookingId(bookingId);
    setLogType("NOTE");
    setLogDescription("");
    setLogOpen(true);
  };

  const handleAddLog = async () => {
    if (!logBookingId || !logDescription.trim()) {
      toast.error("Please enter a log description");
      return;
    }
    try {
      await addLogMutation.mutateAsync({
        booking_id: logBookingId,
        log_type: logType as "FEEDING" | "MEDICINE" | "NOTE",
        description: logDescription.trim(),
      });
      toast.success("Log added successfully");
      setLogOpen(false);
      setLogBookingId(null);
      setLogDescription("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add log");
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

  const columns = [
    {
      header: "Booking #",
      accessorKey: "booking_number" as const,
      cell: ({ original }: { original: PetHotelBooking }) => (
        <div className="font-medium text-slate-900">{original.booking_number}</div>
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
                onClick={() => handleAddLogClick(original.id)}
                title="Add Log"
              >
                <FileText className="h-4 w-4 text-warning-600" />
              </Button>
            </>
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
        <p className="text-lg font-medium">Failed to load pet hotel bookings</p>
        <p className="mt-1 text-sm text-slate-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pet Hotel</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredBookings?.length || 0} bookings</p>
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

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pet Hotel Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField label="Log Type" required>
              <Select value={logType} onValueChange={setLogType}>
                {PET_HOTEL_LOG_TYPES.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
                placeholder="Enter log description"
                rows={3}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLog}>Add Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
