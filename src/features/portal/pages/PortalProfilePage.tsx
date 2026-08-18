import { useAuth } from "@/features/auth/context/AuthContext";
import { usePortalPets } from "../hooks/use-portal";
import { Mail, MapPin, PawPrint, Phone } from "lucide-react";

export default function PortalProfilePage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";

  const { data: pets, isLoading: petsLoading } = usePortalPets(customerId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Profil Saya</h1>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            {user?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.full_name ?? "Customer"}</p>
            <p className="text-sm text-slate-600">{user?.username ?? "customer"}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{user?.customer_id ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>+62 812-3456-7890</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>Jl. Merdeka No. 10, Jakarta</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <PawPrint className="h-4 w-4 text-primary-600" />
          <h2 className="text-lg font-semibold">Hewan Peliharaan</h2>
        </div>
        {petsLoading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="space-y-2">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <div>
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-xs text-slate-500">
                    {pet.species}
                    {pet.breed ? ` • ${pet.breed}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Belum ada hewan peliharaan.</p>
        )}
      </div>
    </div>
  );
}
