import { Bell, Calendar, Home, Hotel, Scissors, User } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", to: "/portal", icon: Home },
  { label: "Appointment", to: "/portal/appointments", icon: Calendar },
  { label: "Grooming", to: "/portal/grooming", icon: Scissors },
  { label: "Hotel", to: "/portal/pet-hotel", icon: Hotel },
  { label: "Profile", to: "/portal/profile", icon: User },
];

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
              Petora
            </p>
            <h1 className="text-lg font-bold">Customer Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              IW
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/portal"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors",
                  isActive ? "bg-primary-50 text-primary-700" : "text-slate-500 hover:bg-slate-100"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
