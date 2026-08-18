import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  usePetWeightLogs,
  useAddWeightLog,
  useDeleteWeightLog,
} from "../hooks/use-pet-medical";

interface PetWeightTabProps {
  petId: string;
}

export default function PetWeightTab({ petId }: PetWeightTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { data: weightLogs = [] } = usePetWeightLogs(petId);
  const addMutation = useAddWeightLog();
  const deleteMutation = useDeleteWeightLog();

  const handleAdd = async () => {
    if (!weight || !recordDate) return;

    await addMutation.mutateAsync({
      pet_id: petId,
      weight_kg: parseFloat(weight),
      recorded_at: new Date(recordDate).toISOString(),
    });

    setWeight("");
    setRecordDate(new Date().toISOString().split("T")[0]);
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this weight entry?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const latestWeight = weightLogs[0]?.weight_kg || 0;
  const previousWeight = weightLogs[1]?.weight_kg || 0;
  const weightChange =
    latestWeight && previousWeight ? latestWeight - previousWeight : 0;

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      {latestWeight > 0 && (
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Current Weight
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {latestWeight.toFixed(2)} kg
            </p>
          </div>
          {previousWeight > 0 && (
            <>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Previous Weight
                </p>
                <p className="mt-1 text-lg text-slate-600">
                  {previousWeight.toFixed(2)} kg
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Change
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    weightChange > 0 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(2)} kg
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Weight Form */}
      <div>
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Weight Entry
          </Button>
        ) : (
          <div className="space-y-4 rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Weight (kg)" required>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </FormField>
              <FormField label="Record Date" required>
                <Input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                />
              </FormField>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={!weight || !recordDate || addMutation.isPending}
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

      {/* Weight History Table */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Weight History
        </h3>
        {weightLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Weight (kg)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {weightLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(log.recorded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {log.weight_kg.toFixed(2)} kg
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-danger-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-slate-500">No weight entries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
