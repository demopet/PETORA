import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Room, RoomStatus, PetHotelBooking } from "@/types/pet-hotel";
import { Card } from "@/components/ui/card";
import { Select, SelectOption } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

const STATUS_COLORS: Record<RoomStatus, string> = {
  AVAILABLE: "bg-success-500",
  RESERVED: "bg-info-500",
  OCCUPIED: "bg-danger-500",
  MAINTENANCE: "bg-slate-400",
  INACTIVE: "bg-slate-300",
};

const CLEANLINESS_COLORS: Record<string, string> = {
  CLEAN: "text-success-600",
  DIRTY: "text-danger-600",
  UNDER_CLEANING: "text-warning-600",
};

export function RoomDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentBooking, setCurrentBooking] = useState<PetHotelBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) {
        toast.error("Failed to load rooms");
        setIsLoading(false);
        return;
      }

      setRooms(data as Room[]);
      setFilteredRooms(data as Room[]);
      setIsLoading(false);
    };

    fetchRooms();
  }, []);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === "all") {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(rooms.filter((room) => room.status === value));
    }
  };

  const handleRoomClick = async (room: Room) => {
    setSelectedRoom(room);

    const { data } = await supabase
      .from("pet_hotel_bookings")
      .select("*")
      .eq("room_id", room.id)
      .in("status", ["BOOKED", "CHECKED_IN"])
      .order("check_in_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCurrentBooking(data as PetHotelBooking | null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Room Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">{filteredRooms.length} rooms</p>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectOption value="all">All Status</SelectOption>
            <SelectOption value="AVAILABLE">Available</SelectOption>
            <SelectOption value="RESERVED">Reserved</SelectOption>
            <SelectOption value="OCCUPIED">Occupied</SelectOption>
            <SelectOption value="MAINTENANCE">Maintenance</SelectOption>
            <SelectOption value="INACTIVE">Inactive</SelectOption>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRoomClick(room)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{room.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[room.status]}`} />
                <div className="flex items-center justify-between text-xs">
                  <StatusBadge status={room.status} />
                </div>
                <div className={`text-xs ${CLEANLINESS_COLORS[room.cleanliness]}`}>
                  {room.cleanliness.replace("_", " ")}
                </div>
                {room.room_number && (
                  <div className="text-xs text-slate-500">#{room.room_number}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Room Name</p>
                  <p className="font-medium text-slate-900">{selectedRoom.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Room Number</p>
                  <p className="font-medium text-slate-900">{selectedRoom.room_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="font-medium text-slate-900">{selectedRoom.room_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Price/Night</p>
                  <p className="font-medium text-slate-900">
                    Rp {selectedRoom.price_per_night.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Capacity</p>
                  <p className="font-medium text-slate-900">{selectedRoom.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <StatusBadge status={selectedRoom.status} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cleanliness</p>
                  <p className={`font-medium ${CLEANLINESS_COLORS[selectedRoom.cleanliness]}`}>
                    {selectedRoom.cleanliness.replace("_", " ")}
                  </p>
                </div>
              </div>

              {currentBooking && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-900 mb-2">Current Booking</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600">
                      Booking #:{" "}
                      <span className="font-medium">{currentBooking.booking_number}</span>
                    </p>
                    <p className="text-slate-600">
                      Check-in: <span className="font-medium">{currentBooking.check_in_date}</span>
                    </p>
                    <p className="text-slate-600">
                      Check-out:{" "}
                      <span className="font-medium">{currentBooking.check_out_date}</span>
                    </p>
                    <p className="text-slate-600">
                      Status: <StatusBadge status={currentBooking.status} />
                    </p>
                  </div>
                </div>
              )}

              {!currentBooking && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">No active booking for this room</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
