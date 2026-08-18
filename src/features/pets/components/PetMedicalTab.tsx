import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  usePetDiseases,
  useAddDisease,
  useDeleteDisease,
  usePetAllergies,
  useAddAllergy,
  useDeleteAllergy,
} from "../hooks/use-pet-medical";

interface PetMedicalTabProps {
  petId: string;
}

export default function PetMedicalTab({ petId }: PetMedicalTabProps) {
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);
  const [diseaseNameInput, setDiseaseNameInput] = useState("");
  const [diseaseDateInput, setDiseaseDateInput] = useState("");
  const [diseaseNotesInput, setDiseaseNotesInput] = useState("");

  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [allergenInput, setAllergenInput] = useState("");
  const [allergyNotesInput, setAllergyNotesInput] = useState("");

  // Diseases
  const { data: diseases = [] } = usePetDiseases(petId);
  const addDiseaseMutation = useAddDisease();
  const deleteDiseaseMutation = useDeleteDisease();

  const handleAddDisease = async () => {
    if (!diseaseNameInput) return;

    await addDiseaseMutation.mutateAsync({
      pet_id: petId,
      disease_name: diseaseNameInput,
      diagnosed_date: diseaseDateInput
        ? new Date(diseaseDateInput).toISOString()
        : null,
      notes: diseaseNotesInput || undefined,
    });

    setDiseaseNameInput("");
    setDiseaseDateInput("");
    setDiseaseNotesInput("");
    setShowDiseaseForm(false);
  };

  const handleDeleteDisease = async (id: string) => {
    if (confirm("Are you sure you want to delete this disease record?")) {
      await deleteDiseaseMutation.mutateAsync(id);
    }
  };

  // Allergies
  const { data: allergies = [] } = usePetAllergies(petId);
  const addAllergyMutation = useAddAllergy();
  const deleteAllergyMutation = useDeleteAllergy();

  const handleAddAllergy = async () => {
    if (!allergenInput) return;

    await addAllergyMutation.mutateAsync({
      pet_id: petId,
      allergen: allergenInput,
      notes: allergyNotesInput || undefined,
    });

    setAllergenInput("");
    setAllergyNotesInput("");
    setShowAllergyForm(false);
  };

  const handleDeleteAllergy = async (id: string) => {
    if (confirm("Are you sure you want to delete this allergy record?")) {
      await deleteAllergyMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Diseases Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Diseases</h3>

        {!showDiseaseForm ? (
          <Button
            onClick={() => setShowDiseaseForm(true)}
            className="mb-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Disease
          </Button>
        ) : (
          <div className="mb-4 space-y-4 rounded-lg bg-slate-50 p-4">
            <FormField label="Disease Name" required>
              <Input
                value={diseaseNameInput}
                onChange={(e) => setDiseaseNameInput(e.target.value)}
                placeholder="e.g., Diabetes, Hip Dysplasia"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Diagnosed Date">
                <Input
                  type="date"
                  value={diseaseDateInput}
                  onChange={(e) => setDiseaseDateInput(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea
                value={diseaseNotesInput}
                onChange={(e) => setDiseaseNotesInput(e.target.value)}
                placeholder="Add any notes about this disease"
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                onClick={handleAddDisease}
                disabled={!diseaseNameInput || addDiseaseMutation.isPending}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDiseaseForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {diseases.length > 0 ? (
          <div className="space-y-3">
            {diseases.map((disease) => (
              <div
                key={disease.id}
                className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">
                    {disease.disease_name}
                  </h4>
                  {disease.diagnosed_date && (
                    <p className="mt-1 text-sm text-slate-600">
                      Diagnosed:{" "}
                      {new Date(disease.diagnosed_date).toLocaleDateString()}
                    </p>
                  )}
                  {disease.notes && (
                    <p className="mt-2 text-sm text-slate-700">
                      {disease.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDisease(disease.id)}
                  disabled={deleteDiseaseMutation.isPending}
                  className="ml-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : !showDiseaseForm ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-slate-500">No diseases recorded</p>
          </div>
        ) : null}
      </div>

      {/* Allergies Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Allergies</h3>

        {!showAllergyForm ? (
          <Button
            onClick={() => setShowAllergyForm(true)}
            className="mb-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Allergy
          </Button>
        ) : (
          <div className="mb-4 space-y-4 rounded-lg bg-slate-50 p-4">
            <FormField label="Allergen" required>
              <Input
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                placeholder="e.g., Chicken, Wheat, Dairy"
                required
              />
            </FormField>

            <FormField label="Notes">
              <Textarea
                value={allergyNotesInput}
                onChange={(e) => setAllergyNotesInput(e.target.value)}
                placeholder="Add any notes about this allergy"
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                onClick={handleAddAllergy}
                disabled={!allergenInput || addAllergyMutation.isPending}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAllergyForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {allergies.length > 0 ? (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">
                    {allergy.allergen}
                  </h4>
                  {allergy.notes && (
                    <p className="mt-2 text-sm text-slate-700">
                      {allergy.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAllergy(allergy.id)}
                  disabled={deleteAllergyMutation.isPending}
                  className="ml-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : !showAllergyForm ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-slate-500">No allergies recorded</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
