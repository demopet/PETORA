import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("medical-records RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let doctorUserId: string;
  let otherDoctorUserId: string;
  let customerId: string;
  let petId: string;
  let appointmentId: string;
  let medicalRecordId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-med-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Med Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const doctorResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-med-doctor",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "RLS Med Doctor",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const otherDoctorResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-med-other-doctor",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "RLS Med Other Doctor",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error)
      console.error("Create owner error:", ownerResult.error);
    if (doctorResult.error)
      console.error("Create doctor error:", doctorResult.error);
    if (otherDoctorResult.error)
      console.error("Create other doctor error:", otherDoctorResult.error);

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-med-owner",
      p_pin: "123456",
    });
    const doctorLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-med-doctor",
      p_pin: "123456",
    });
    const otherDoctorLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-med-other-doctor",
      p_pin: "123456",
    });

    if (ownerLogin.data) ownerUserId = ownerLogin.data.user.id;
    if (doctorLogin.data) doctorUserId = doctorLogin.data.user.id;
    if (otherDoctorLogin.data)
      otherDoctorUserId = otherDoctorLogin.data.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Medical Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "RLS Med Pet",
      p_species: "Dog",
    });

    if (petData) petId = petData.id as string;

    const { data: aptData } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_doctor_id: doctorUserId,
      p_appointment_date: "2025-12-01",
      p_appointment_time: "10:00",
    });

    if (aptData) appointmentId = (aptData as any).id;

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
        .rpc("fn_delete_pet", { p_caller_id: ownerUserId, p_pet_id: petId })
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

  it("owner can create medical record", async () => {
    const { data, error } = await supabase.rpc("fn_create_medical_record", {
      p_caller_id: ownerUserId,
      p_appointment_id: appointmentId,
      p_chief_complaint: "Owner test",
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    medicalRecordId = (data as any).id;
  });

  it("assigned doctor can create medical record", async () => {
    const { data: aptData } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_doctor_id: doctorUserId,
      p_appointment_date: "2025-12-02",
      p_appointment_time: "11:00",
    });

    const newAptId = (aptData as any).id;

    await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: newAptId,
      p_new_status: "IN_PROGRESS",
    });

    const { data, error } = await supabase.rpc("fn_create_medical_record", {
      p_caller_id: doctorUserId,
      p_appointment_id: newAptId,
      p_chief_complaint: "Doctor created",
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();

    const recordId = (data as any).id;
    await supabase
      .rpc("fn_delete_medical_record", {
        p_caller_id: ownerUserId,
        p_medical_record_id: recordId,
      })
      .catch(() => {});
  });

  it("non-assigned doctor cannot create medical record", async () => {
    const { data: aptData } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_doctor_id: otherDoctorUserId,
      p_appointment_date: "2025-12-03",
      p_appointment_time: "12:00",
    });

    const newAptId = (aptData as any).id;

    await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: newAptId,
      p_new_status: "IN_PROGRESS",
    });

    const { error } = await supabase.rpc("fn_create_medical_record", {
      p_caller_id: doctorUserId,
      p_appointment_id: newAptId,
      p_chief_complaint: "Unauthorized",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");
  });

  it("doctor can update own medical record", async () => {
    const { error } = await supabase.rpc("fn_update_medical_record", {
      p_caller_id: doctorUserId,
      p_medical_record_id: medicalRecordId,
      p_diagnosis: "Updated by owner",
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("medical_records")
      .select("diagnosis")
      .eq("id", medicalRecordId)
      .single();

    expect(data!.diagnosis).toBe("Updated by owner");
  });

  it("other doctor cannot update medical record", async () => {
    const { error } = await supabase.rpc("fn_update_medical_record", {
      p_caller_id: otherDoctorUserId,
      p_medical_record_id: medicalRecordId,
      p_diagnosis: "Hacked",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");
  });

  it("admin can update any medical record", async () => {
    const { data: adminLogin } = await supabase.rpc("fn_auth_login", {
      p_username: "rls-apt-admin",
      p_pin: "123456",
    });

    const adminId = (adminLogin as any).user.id;

    const { error } = await supabase.rpc("fn_update_medical_record", {
      p_caller_id: adminId,
      p_medical_record_id: medicalRecordId,
      p_diagnosis: "Updated by admin",
    });

    expect(error).toBeNull();
  });

  it("owner can delete medical record", async () => {
    const { error } = await supabase.rpc("fn_delete_medical_record", {
      p_caller_id: ownerUserId,
      p_medical_record_id: medicalRecordId,
    });

    expect(error).toBeNull();
  });
});
