import {
  Bell,
  CalendarDays,
  Gift,
  PawPrint,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

const quickActions = [
  { label: "Appointment", icon: CalendarDays },
  { label: "Grooming", icon: PawPrint },
  { label: "Shop", icon: ShoppingBag },
  { label: "Rewards", icon: Gift },
];

export default function PortalHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">
            Petora
          </p>
          <h1 className="mt-1 text-2xl font-bold">Selamat pagi, Ibu Wati 👋</h1>
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
        <p className="text-sm font-medium text-primary-700">
          Appointment berikutnya
        </p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Buddy</p>
            <p className="text-sm text-slate-600">25 Aug 2026 • 10:00</p>
            <p className="text-sm text-slate-600">drg. Rina • Vaksin Booster</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            Lihat detail
          </button>
        </div>
      </section>

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hewan Peliharaan Saya</h2>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold">Buddy</p>
            <p className="text-sm text-slate-600">Golden Retriever • 3 tahun</p>
            <p className="mt-1 text-sm text-amber-600">💉 Vaksin: 1 Overdue</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold">Mimi</p>
            <p className="text-sm text-slate-600">Persia • 2 tahun</p>
            <p className="mt-1 text-sm text-emerald-600">
              💉 Vaksin: Semua up-to-date
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rewards Anda</h2>
          <span className="text-sm font-medium text-primary-700">
            2,450 poin
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Poin tersedia untuk ditukarkan dengan layanan berikutnya.
        </p>
      </section>
    </div>
  );
}
