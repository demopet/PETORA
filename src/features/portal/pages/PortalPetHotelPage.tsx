import { useState, type FormEvent } from "react";
import { Plus, X, Hotel } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  usePortalPets,
  usePortalPetHotelBookings,
  useCreatePortalPetHotelBooking,
} from "../hooks/use-portal";
import { formatDate } from "@/lib/utils";
import type { Pet } from "@/types";

export default function PortalPetHotelPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const callerUserId = user?.id ?? "";

  const { data: pets, isLoading: petsLoading } = usePortalPets(customerId);
  const {
    data: bookings,
    isLoading: bookingsLoading,
    refetch,
  } = usePortalPetHotelBookings(customerId);
  const createMutation = useCreatePortalPetHotelBooking(callerUserId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerId || !selectedPetId || !checkIn || !checkOut) return;

    await createMutation.mutateAsync({
      customer_id: customerId,
      pet_id: selectedPetId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      special_notes: specialNotes || undefined,
    });

    setIsFormOpen(false);
    setSelectedPetId("");
    setCheckIn("");
    setCheckOut("");
    setSpecialNotes("");
    void refetch();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-blue-100 text-blue-700";
      case "CHECKED_IN":
        return "bg-amber-100 text-amber-700";
      case "CHECKED_OUT":
        return "bg-emerald-100 text-emerald-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pet Hotel</h1>
          <p className="mt-1 text-sm text-slate-600">
            Booking penginapan untuk hewan peliharaan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Booking Baru
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Booking Pet Hotel</h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pet-select" className="mb-2 block text-sm font-medium">
                Pilih Hewan
              </label>
              {petsLoading ? (
                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
              ) : pets && pets.length > 0 ? (
                <select
                  id="pet-select"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  required
                >
                  <option value="">Pilih hewan</option>
                  {pets.map((pet: Pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} - {pet.species}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-500">Belum ada hewan peliharaan.</p>
              )}
            </div>

            <div>
              <label htmlFor="check-in" className="mb-2 block text-sm font-medium">
                Check-in
              </label>
              <input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="check-out" className="mb-2 block text-sm font-medium">
                Check-out
              </label>
              <input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="special-notes" className="mb-2 block text-sm font-medium">
                Catatan Khusus
              </label>
              <textarea
                id="special-notes"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                placeholder="Alergi, kebiasaan makan, dll..."
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-primary-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {createMutation.isPending ? "Membuat..." : "Buat Booking"}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-red-600">{(createMutation.error as Error).message}</p>
            )}
          </form>
        </div>
      )}

      <div className="space-y-3">
        {bookingsLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ) : bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Hotel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {pets?.find((p) => p.id === booking.pet_id)?.name ?? "Hewan"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </p>
                    <p className="text-sm text-slate-600">{booking.booking_number}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(booking.status)}`}
                >
                  {booking.status.replace("_", " ")}
                </span>
              </div>
              {booking.special_notes && (
                <p className="mt-2 text-xs text-slate-500">Catatan: {booking.special_notes}</p>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Hotel className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-600">Belum ada booking pet hotel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
