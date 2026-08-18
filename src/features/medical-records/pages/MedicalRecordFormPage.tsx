import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useMedicalRecord,
} from "../hooks/use-medical-records";
import { useAppointment } from "@/features/appointments/hooks/use-appointments";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import type { CreateMedicalRecordInput } from "@/types/medical-record";

export default function MedicalRecordFormPage() {
  const { recordId } = useParams<{ recordId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId");

  const { data: record } = useMedicalRecord(recordId || "");
  const { data: appointment } = useAppointment(appointmentId || "");
  const { data: customers } = useCustomers();
  const { data: pets } = usePets();

  const createMutation = useCreateMedicalRecord();
  const updateMutation = useUpdateMedicalRecord();

  const [formData, setFormData] = useState({
    chief_complaint: "",
    history: "",
    physical_exam: "",
    weight_kg: "",
    temperature_c: "",
    heart_rate_bpm: "",
    respiratory_rate_bpm: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    lab_results: "",
    additional_notes: "",
    attachments: [] as string[],
  });

  useEffect(() => {
    if (record) {
      setFormData({
        chief_complaint: record.chief_complaint || "",
        history: record.history || "",
        physical_exam: record.physical_exam || "",
        weight_kg: record.weight_kg?.toString() || "",
        temperature_c: record.temperature_c?.toString() || "",
        heart_rate_bpm: record.heart_rate_bpm?.toString() || "",
        respiratory_rate_bpm: record.respiratory_rate_bpm?.toString() || "",
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
        prescription: record.prescription || "",
        lab_results: record.lab_results || "",
        additional_notes: record.additional_notes || "",
        attachments: record.attachments || [],
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recordId) {
      // Update existing record
      await updateMutation.mutateAsync({
        id: recordId,
        input: {
          chief_complaint: formData.chief_complaint || undefined,
          history: formData.history || undefined,
          physical_exam: formData.physical_exam || undefined,
          weight_kg: formData.weight_kg
            ? parseFloat(formData.weight_kg)
            : undefined,
          temperature_c: formData.temperature_c
            ? parseFloat(formData.temperature_c)
            : undefined,
          heart_rate_bpm: formData.heart_rate_bpm
            ? parseInt(formData.heart_rate_bpm, 10)
            : undefined,
          respiratory_rate_bpm: formData.respiratory_rate_bpm
            ? parseInt(formData.respiratory_rate_bpm, 10)
            : undefined,
          diagnosis: formData.diagnosis || undefined,
          treatment: formData.treatment || undefined,
          prescription: formData.prescription || undefined,
          lab_results: formData.lab_results || undefined,
          additional_notes: formData.additional_notes || undefined,
          attachments: formData.attachments,
        },
      });
    } else if (appointmentId && appointment) {
      // Create new record from appointment
      const input: CreateMedicalRecordInput = {
        appointment_id: appointmentId,
        chief_complaint: formData.chief_complaint || undefined,
        history: formData.history || undefined,
        physical_exam: formData.physical_exam || undefined,
        weight_kg: formData.weight_kg
          ? parseFloat(formData.weight_kg)
          : undefined,
        temperature_c: formData.temperature_c
          ? parseFloat(formData.temperature_c)
          : undefined,
        heart_rate_bpm: formData.heart_rate_bpm
          ? parseInt(formData.heart_rate_bpm, 10)
          : undefined,
        respiratory_rate_bpm: formData.respiratory_rate_bpm
          ? parseInt(formData.respiratory_rate_bpm, 10)
          : undefined,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        prescription: formData.prescription || undefined,
        lab_results: formData.lab_results || undefined,
        additional_notes: formData.additional_notes || undefined,
        attachments: formData.attachments,
      };

      await createMutation.mutateAsync(input);
    }

    navigate("/medical-records");
  };

  const customer = appointment
    ? customers?.find((c) => c.id === appointment.customer_id)
    : undefined;
  const pet = appointment
    ? pets?.find((p) => p.id === appointment.pet_id)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/medical-records")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">
          {recordId ? "Edit Medical Record" : "Create Medical Record"}
        </h1>
      </div>

      {/* Appointment Info (if creating from appointment) */}
      {appointment && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Associated Appointment
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-blue-700">Customer</p>
              <p className="font-medium text-blue-900">{customer?.name}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Pet</p>
              <p className="font-medium text-blue-900">
                {pet?.name} ({pet?.species})
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Date</p>
              <p className="font-medium text-blue-900">
                {appointment.appointment_date}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Time</p>
              <p className="font-medium text-blue-900">
                {appointment.appointment_time}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chief Complaint */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Chief Complaint & History
          </h2>

          <div className="space-y-4">
            <FormField label="Chief Complaint">
              <Textarea
                value={formData.chief_complaint}
                onChange={(e) =>
                  setFormData({ ...formData, chief_complaint: e.target.value })
                }
                placeholder="What is the main reason for this visit?"
                rows={3}
              />
            </FormField>

            <FormField label="Medical History">
              <Textarea
                value={formData.history}
                onChange={(e) =>
                  setFormData({ ...formData, history: e.target.value })
                }
                placeholder="Relevant medical history"
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Physical Exam */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Physical Examination
          </h2>

          <div className="space-y-4">
            <FormField label="Physical Exam Findings">
              <Textarea
                value={formData.physical_exam}
                onChange={(e) =>
                  setFormData({ ...formData, physical_exam: e.target.value })
                }
                placeholder="Describe physical examination findings"
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Vital Signs
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <FormField label="Weight (kg)">
              <Input
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
                placeholder="0.0"
              />
            </FormField>

            <FormField label="Temperature (°C)">
              <Input
                type="number"
                step="0.1"
                value={formData.temperature_c}
                onChange={(e) =>
                  setFormData({ ...formData, temperature_c: e.target.value })
                }
                placeholder="37.5"
              />
            </FormField>

            <FormField label="Heart Rate (bpm)">
              <Input
                type="number"
                value={formData.heart_rate_bpm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    heart_rate_bpm: e.target.value,
                  })
                }
                placeholder="80"
              />
            </FormField>

            <FormField label="Respiratory Rate (bpm)">
              <Input
                type="number"
                value={formData.respiratory_rate_bpm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    respiratory_rate_bpm: e.target.value,
                  })
                }
                placeholder="20"
              />
            </FormField>
          </div>
        </div>

        {/* Diagnosis & Treatment */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Diagnosis & Treatment
          </h2>

          <div className="space-y-4">
            <FormField label="Diagnosis">
              <Textarea
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                placeholder="Veterinary diagnosis"
                rows={3}
              />
            </FormField>

            <FormField label="Treatment Plan">
              <Textarea
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                placeholder="Recommended treatment"
                rows={3}
              />
            </FormField>

            <FormField label="Prescription">
              <Textarea
                value={formData.prescription}
                onChange={(e) =>
                  setFormData({ ...formData, prescription: e.target.value })
                }
                placeholder="Medications and dosage"
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Lab Results & Notes */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Lab Results & Additional Notes
          </h2>

          <div className="space-y-4">
            <FormField label="Lab Results">
              <Textarea
                value={formData.lab_results}
                onChange={(e) =>
                  setFormData({ ...formData, lab_results: e.target.value })
                }
                placeholder="Any lab test results"
                rows={3}
              />
            </FormField>

            <FormField label="Additional Notes">
              <Textarea
                value={formData.additional_notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additional_notes: e.target.value,
                  })
                }
                placeholder="Any other relevant information"
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Attachments */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Attachments
          </h2>
          <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
            <Upload className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Upload attachments
              </p>
              <p className="text-xs text-slate-500">
                Images, test results, or other documents
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {recordId ? "Update Record" : "Create Record"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/medical-records")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
