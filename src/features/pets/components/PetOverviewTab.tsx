import type { Pet } from "@/types/pet";

interface PetOverviewTabProps {
  petId: string;
  pet: Pet;
}

export default function PetOverviewTab({
  petId: _petId,
  pet,
}: PetOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Name</p>
            <p className="mt-1 text-slate-900">{pet.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Species</p>
            <p className="mt-1 text-slate-900">{pet.species}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Breed</p>
            <p className="mt-1 text-slate-900">{pet.breed || "-"}</p>
          </div>
          {pet.birth_date && (
            <div>
              <p className="text-sm font-medium text-slate-500">Birth Date</p>
              <p className="mt-1 text-slate-900">
                {new Date(pet.birth_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {pet.gender && (
            <div>
              <p className="text-sm font-medium text-slate-500">Gender</p>
              <p className="mt-1 text-slate-900">{pet.gender}</p>
            </div>
          )}
          {pet.microchip_number && (
            <div>
              <p className="text-sm font-medium text-slate-500">
                Microchip Number
              </p>
              <p className="mt-1 font-mono text-sm text-slate-900">
                {pet.microchip_number}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Status</h3>
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              pet.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                pet.is_active ? "bg-green-600" : "bg-gray-600"
              }`}
            />
            {pet.is_active ? "Active" : "Inactive"}
          </div>
        </div>
      </div>
    </div>
  );
}
