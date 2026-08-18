import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("medical-records integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let customerId: string;
  let petId: string;
  let appointmentId: string;
  let doctorUserId: string;
  let medicalRecordId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "med-integ-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Medical Integration Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }

    const doctorResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "med-integ-doctor",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "Medical Integration Doctor",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (doctorResult.error) {
      console.error("Create doctor error:", doctorResult.error);
    }

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "med-integ-owner",
      p_pin: "123456",
    });

    const { data: doctorData } = await supabase.rpc("fn_auth_login", {
      p_username: "med-integ-doctor",
      p_pin: "123456",
    });

    if (ownerData) {
      ownerUserId = ownerData.user.id;
    }
    if (doctorData) {
      doctorUserId = doctorData.user.id;
    }

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Medical Integration Customer",
      p_phone: "081234567890",
    });

    if (customerData) {
      customerId = customerData.id as string;
    }

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "Medical Integ Pet",
      p_species: "Cat",
      p_breed: "Persian",
    });

    if (petData) {
      petId = petData.id as string;
    }

    const { data: aptData } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_doctor_id: doctorUserId,
      p_appointment_date: "2025-12-01",
      p_appointment_time: "10:00",
    });

    if (aptData) {
      appointmentId = (aptData as any).id;
    }

    await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: appointmentId,
      p_new_status: "IN_PROGRESS",
    });
  });

  afterAll(async () => {
    if (medicalRecordId) {
      await supabase
        .rpc("fn_delete_medical_record", {
          p_caller_id: ownerUserId,
          p_medical_record_id: medicalRecordId,
        })
        .catch(() => {});
    }
    if (appointmentId) {
      await supabase
        .rpc("fn_cancel_appointment", {
          p_caller_id: ownerUserId,
          p_appointment_id: appointmentId,
          p_reason: "Cleanup",
        })
        .catch(() => {});
    }
    if (petId) {
      await supabase
        .rpc("fn_delete_pet", {
          p_caller_id: ownerUserId,
          p_pet_id: petId,
        })
        .catch(() => {});
    }
    if (customerId) {
      await supabase
        .rpc("fn_delete_customer", {
          p_caller_id: ownerUserId,
          p_customer_id: customerId,
        })
        .catch(() => {});
    }
  });

  it("creates a medical record via fn_create_medical_record", async () => {
    const { data, error } = await supabase.rpc("fn_create_medical_record", {
      p_caller_id: doctorUserId,
      p_appointment_id: appointmentId,
      p_chief_complaint: "Lethargy and loss of appetite",
      p_history: "No prior conditions",
      p_weight_kg: 4.5,
      p_temperature_c: 38.5,
      p_heart_rate_bpm: 140,
      p_respiratory_rate_bpm: 24,
      p_diagnosis: "Upper respiratory infection",
      p_treatment: "Antibiotics for 7 days",
      p_prescription: "Amoxicillin 10mg/kg BID",
    });

    if (error) {
      console.error("Create medical record error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect((data as any)?.id).toBeDefined();
    medicalRecordId = (data as any).id;
  });

  it("retrieves the created medical record", async () => {
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("id", medicalRecordId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.record_number).toMatch(/^MR-\d{8}-\d{4}$/);
    expect(data!.diagnosis).toBe("Upper respiratory infection");
  });

  it("prevents duplicate medical record for same appointment", async () => {
    const { error } = await supabase.rpc("fn_create_medical_record", {
      p_caller_id: doctorUserId,
      p_appointment_id: appointmentId,
      p_chief_complaint: "Duplicate",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("MEDICAL_RECORD_ALREADY_EXISTS");
  });

  it("updates a medical record via fn_update_medical_record", async () => {
    const { data, error } = await supabase.rpc("fn_update_medical_record", {
      p_caller_id: doctorUserId,
      p_medical_record_id: medicalRecordId,
      p_diagnosis: "Upper respiratory infection - resolved",
      p_additional_notes: "Follow up in 1 week",
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(medicalRecordId);

    const { data: record } = await supabase
      .from("medical_records")
      .select("diagnosis, additional_notes")
      .eq("id", medicalRecordId)
      .single();

    expect(record!.diagnosis).toBe("Upper respiratory infection - resolved");
    expect(record!.additional_notes).toBe("Follow up in 1 week");
  });

  it("soft deletes a medical record via fn_delete_medical_record", async () => {
    const { error } = await supabase.rpc("fn_delete_medical_record", {
      p_caller_id: ownerUserId,
      p_medical_record_id: medicalRecordId,
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("medical_records")
      .select("deleted_at")
      .eq("id", medicalRecordId)
      .single();

    expect(data!.deleted_at).not.toBeNull();
  });
});
