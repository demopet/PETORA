import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  usePetVaccines,
  useAddVaccine,
  useDeleteVaccine,
} from "../hooks/use-pet-medical";

interface PetVaccineTabProps {
  petId: string;
}

export default function PetVaccineTab({ petId }: PetVaccineTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vaccineName, setVaccineName] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: vaccines = [] } = usePetVaccines(petId);
  const addMutation = useAddVaccine();
  const deleteMutation = useDeleteVaccine();

  const handleAdd = async () => {
    if (!vaccineName || !vaccinationDate) return;

    await addMutation.mutateAsync({
      pet_id: petId,
      vaccine_name: vaccineName,
      vaccination_date: new Date(vaccinationDate).toISOString(),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      notes: notes || undefined,
    });

    setVaccineName("");
    setVaccinationDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vaccine record?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const isVaccineOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const overdueCount = vaccines.filter((v) =>
    isVaccineOverdue(v.due_date),
  ).length;

  return (
    <div className="space-y-6">
      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-4 text-orange-900">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {overdueCount} vaccine{overdueCount > 1 ? "s" : ""} overdue
            </p>
            <p className="text-sm">Please schedule a vaccination appointment</p>
          </div>
        </div>
      )}

      {/* Add Vaccine Form */}
      <div>
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vaccine
          </Button>
        ) : (
          <div className="space-y-4 rounded-lg bg-slate-50 p-4">
            <FormField label="Vaccine Name" required>
              <Input
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                placeholder="e.g., Rabies, DHPP, FeLV"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Vaccination Date" required>
                <Input
                  type="date"
                  value={vaccinationDate}
                  onChange={(e) => setVaccinationDate(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Due Date (Next)">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this vaccination"
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={
                  !vaccineName || !vaccinationDate || addMutation.isPending
                }
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Vaccine List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Vaccines</h3>
        {vaccines.length > 0 ? (
          <div className="space-y-4">
            {vaccines.map((vaccine) => {
              const overdue = isVaccineOverdue(vaccine.due_date);
              return (
                <div
                  key={vaccine.id}
                  className={`rounded-lg border p-4 ${
                    overdue
                      ? "border-orange-200 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900">
                          {vaccine.vaccine_name}
                        </h4>
                        {overdue && (
                          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Vaccinated
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {new Date(
                              vaccine.vaccination_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {vaccine.due_date && (
                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Due Date
                            </p>
                            <p
                              className={`mt-1 text-sm ${
                                overdue
                                  ? "font-semibold text-orange-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {new Date(vaccine.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {vaccine.notes && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-slate-500">
                            Notes
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {vaccine.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vaccine.id)}
                      disabled={deleteMutation.isPending}
                      className="ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-danger-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-slate-500">No vaccines recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
