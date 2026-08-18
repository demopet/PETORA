import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("appointments RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let doctorUserId: string;
  let customerId: string;
  let petId: string;
  let appointmentId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-apt-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Appt Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-apt-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Appt Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const doctorResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-apt-doctor",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "RLS Appt Doctor",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error)
      console.error("Create owner error:", ownerResult.error);
    if (adminResult.error)
      console.error("Create admin error:", adminResult.error);
    if (doctorResult.error)
      console.error("Create doctor error:", doctorResult.error);

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-apt-owner",
      p_pin: "123456",
    });
    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-apt-admin",
      p_pin: "123456",
    });
    const doctorLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-apt-doctor",
      p_pin: "123456",
    });

    if (ownerLogin.data) ownerUserId = ownerLogin.data.user.id;
    if (adminLogin.data) adminUserId = adminLogin.data.user.id;
    if (doctorLogin.data) doctorUserId = doctorLogin.data.user.id;

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Appointment Customer",
      p_phone: "081234567890",
    });

    if (customerData) customerId = customerData.id as string;

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "RLS Apt Pet",
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
  });

  afterAll(async () => {
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

  it("authenticated users can select appointments", async () => {
    const { data, error } = await supabase.from("appointments").select("id");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can create appointment", async () => {
    const { data, error } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_appointment_date: "2025-12-03",
      p_appointment_time: "11:00",
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("doctor can update status of own appointment to IN_PROGRESS", async () => {
    const { data } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_doctor_id: doctorUserId,
      p_appointment_date: "2025-12-04",
      p_appointment_time: "09:00",
    });

    const newAptId = (data as any).id;

    const { error: statusError } = await supabase.rpc(
      "fn_update_appointment_status",
      {
        p_caller_id: doctorUserId,
        p_appointment_id: newAptId,
        p_new_status: "IN_PROGRESS",
      },
    );

    expect(statusError).toBeNull();
  });

  it("non-assigned doctor cannot update status of appointment", async () => {
    await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-apt-other-doctor",
      p_pin: "123456",
      p_role: "DOKTER",
      p_full_name: "Other Doctor",
      p_created_by: ownerUserId,
    });

    const { data: otherDoctorLogin } = await supabase.rpc("fn_auth_login", {
      p_username: "rls-apt-other-doctor",
      p_pin: "123456",
    });

    const otherDoctorId = (otherDoctorLogin as any).user.id;

    const { error } = await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: otherDoctorId,
      p_appointment_id: appointmentId,
      p_new_status: "IN_PROGRESS",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");
  });

  it("admin can update any appointment status", async () => {
    const { error } = await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: adminUserId,
      p_appointment_id: appointmentId,
      p_new_status: "CANCELLED",
    });

    expect(error).toBeNull();
  });

  it("invalid state transition returns error", async () => {
    const { data: newApt } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_appointment_date: "2025-12-05",
      p_appointment_time: "08:00",
    });

    const newAptId = (newApt as any).id;

    const { error } = await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: newAptId,
      p_new_status: "DONE",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("INVALID_STATE_TRANSITION");
  });
});
