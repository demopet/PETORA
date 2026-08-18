import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Gift, PawPrint, ShoppingBag, UserCircle, Bell } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usePortalPets, usePortalAppointments, usePortalLoyaltyMember } from "../hooks/use-portal";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types";

function getUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  const now = new Date();
  const upcoming = appointments
    .filter((a) => {
      const date = new Date(`${a.appointment_date}T${a.appointment_time}`);
      return date >= now && a.status !== "CANCELLED";
    })
    .sort((a, b) => {
      const da = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const db = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return da.getTime() - db.getTime();
    });

  return upcoming[0] ?? null;
}

const quickActions = [
  { label: "Appointment", to: "/portal/appointments", icon: CalendarDays },
  { label: "Grooming", to: "/portal/grooming", icon: PawPrint },
  { label: "Shop", to: "/portal/shop", icon: ShoppingBag },
  { label: "Rewards", to: "/portal/loyalty", icon: Gift },
];

export default function PortalHomePage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";

  const { data: pets, isLoading: petsLoading } = usePortalPets(customerId);
  const { data: appointments, isLoading: appointmentsLoading } = usePortalAppointments(customerId);
  const { data: loyaltyMember, isLoading: loyaltyLoading } = usePortalLoyaltyMember(customerId);

  const upcomingAppointment = useMemo(
    () => getUpcomingAppointment(appointments ?? []),
    [appointments]
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">Petora</p>
          <h1 className="mt-1 text-2xl font-bold">
            Selamat pagi, {user?.full_name?.split(" ")[0] ?? "Customer"} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600"
          >
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-4 shadow-sm">
        <p className="text-sm font-medium text-primary-700">Appointment berikutnya</p>
        {appointmentsLoading ? (
          <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-200" />
        ) : upcomingAppointment ? (
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">
                {pets?.find((p) => p.id === upcomingAppointment.pet_id)?.name ?? "Hewan"}
              </p>
              <p className="text-sm text-slate-600">
                {formatDate(upcomingAppointment.appointment_date)} •{" "}
                {formatTime(upcomingAppointment.appointment_time)}
              </p>
              <p className="text-sm text-slate-600">
                {upcomingAppointment.complaint ?? "Konsultasi umum"}
              </p>
            </div>
            <Link
              to="/portal/appointments"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Lihat detail
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Tidak ada appointment mendatang.</p>
        )}
      </section>

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hewan Peliharaan Saya</h2>
        </div>
        {petsLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="space-y-3">
            {pets.map((pet) => (
              <div key={pet.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold">{pet.name}</p>
                <p className="text-sm text-slate-600">
                  {pet.species}
                  {pet.breed ? ` • ${pet.breed}` : ""}
                  {pet.birth_date
                    ? ` • ${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} tahun`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Belum ada hewan peliharaan.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rewards Anda</h2>
          {loyaltyLoading ? (
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            <span className="text-sm font-medium text-primary-700">
              {loyaltyMember ? loyaltyMember.available_points.toLocaleString("id-ID") : 0} poin
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Poin tersedia untuk ditukarkan dengan layanan berikutnya.
        </p>
        {loyaltyMember?.loyalty_tiers && (
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary-600">
            {loyaltyMember.loyalty_tiers.tier_name}
          </p>
        )}
      </section>
    </div>
  );
}
