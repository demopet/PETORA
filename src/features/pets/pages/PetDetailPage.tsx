import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetAvatar } from "@/components/data-display/pet-avatar";
import { usePet } from "../hooks/use-pets";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import PetOverviewTab from "../components/PetOverviewTab";
import PetWeightTab from "../components/PetWeightTab";
import PetVaccineTab from "../components/PetVaccineTab";
import PetMedicalTab from "../components/PetMedicalTab";
import PetIDCardTab from "../components/PetIDCardTab";

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const petIdParam = petId || "";
  const { data: pet, isLoading, error } = usePet(petIdParam);
  const { data: customers } = useCustomers();

  if (!petId) {
    return (
      <div className="space-y-6">
        <div className="text-danger-500">Pet ID not found</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pets
          </Button>
        </div>
        <div className="text-danger-500">Error loading pet details</div>
      </div>
    );
  }

  const ownerName = customers?.find((c) => c.id === pet.customer_id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <PetAvatar
            name={pet.name}
            species={pet.species}
            photoUrl={pet.photo_url || undefined}
            size="xl"
          />
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pets")}
              className="mb-2 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">{pet.name}</h1>
            <p className="mt-1 text-slate-600">
              {pet.species}
              {pet.breed && ` • ${pet.breed}`} • Owner: {ownerName}
            </p>
            {pet.gender && <p className="mt-1 text-sm text-slate-500">Gender: {pet.gender}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {pet.photo_url && (
        <div className="rounded-lg bg-slate-100 p-4">
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="max-h-64 w-full rounded-lg object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-6 md:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Species</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{pet.species}</p>
        </div>
        {pet.breed && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Breed</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{pet.breed}</p>
          </div>
        )}
        {pet.birth_date && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Birth Date</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {new Date(pet.birth_date).toLocaleDateString()}
            </p>
          </div>
        )}
        {pet.microchip_number && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Microchip</p>
            <p className="mt-1 font-mono text-sm text-slate-900">{pet.microchip_number}</p>
          </div>
        )}
      </div>

      <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "overview"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("weight")}
              className={
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "weight"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              Weight History
            </button>
            <button
              onClick={() => setActiveTab("vaccines")}
              className={
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "vaccines"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              Vaccines
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "medical"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              Medical History
            </button>
            <button
              onClick={() => setActiveTab("idcard")}
              className={
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors " +
                (activeTab === "idcard"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              Digital ID Card
            </button>
          </div>
        </div>
        <div className="pt-6">
          {activeTab === "overview" && <PetOverviewTab petId={pet.id} pet={pet} />}
          {activeTab === "weight" && <PetWeightTab petId={pet.id} />}
          {activeTab === "vaccines" && <PetVaccineTab petId={pet.id} />}
          {activeTab === "medical" && <PetMedicalTab petId={pet.id} />}
          {activeTab === "idcard" && <PetIDCardTab petId={pet.id} pet={pet} />}
        </div>
      </div>
    </div>
  );
}
