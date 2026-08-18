import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("appointments integration", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let customerId: string;
  let petId: string;
  let appointmentId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "apt-integ-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Appointment Integration Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "apt-integ-owner",
      p_pin: "123456",
    });

    if (ownerData) {
      ownerUserId = ownerData.user.id;
    }

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Appointment Integration Customer",
      p_phone: "081234567890",
    });

    if (customerData) {
      customerId = customerData.id as string;
    }

    const { data: petData } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "Apt Integ Pet",
      p_species: "Dog",
      p_breed: "Golden Retriever",
    });

    if (petData) {
      petId = petData.id as string;
    }
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

  it("creates an appointment via fn_create_appointment", async () => {
    const { data, error } = await supabase.rpc("fn_create_appointment", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_pet_id: petId,
      p_appointment_date: "2025-12-01",
      p_appointment_time: "10:00",
      p_complaint: "Routine checkup",
      p_notes: "Bring vaccination records",
    });

    if (error) {
      console.error("Create appointment error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect((data as any)?.id).toBeDefined();
    appointmentId = (data as any).id;
  });

  it("retrieves the created appointment", async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.status).toBe("WAITING");
    expect(data!.queue_number).toBeGreaterThan(0);
  });

  it("updates appointment status from WAITING to IN_PROGRESS", async () => {
    const { data, error } = await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: appointmentId,
      p_new_status: "IN_PROGRESS",
    });

    expect(error).toBeNull();
    expect((data as any)?.id).toBe(appointmentId);

    const { data: apt } = await supabase
      .from("appointments")
      .select("status")
      .eq("id", appointmentId)
      .single();

    expect(apt!.status).toBe("IN_PROGRESS");
  });

  it("completes appointment and triggers medical record prompt", async () => {
    const { data, error } = await supabase.rpc("fn_update_appointment_status", {
      p_caller_id: ownerUserId,
      p_appointment_id: appointmentId,
      p_new_status: "DONE",
    });

    expect(error).toBeNull();
    expect((data as any)?.prompt_create_medical_record).toBe(true);

    const { data: apt } = await supabase
      .from("appointments")
      .select("status")
      .eq("id", appointmentId)
      .single();

    expect(apt!.status).toBe("DONE");
  });

  it("cancels a WAITING appointment", async () => {
    const { data: cancelApt, error: cancelError } = await supabase.rpc(
      "fn_create_appointment",
      {
        p_caller_id: ownerUserId,
        p_customer_id: customerId,
        p_pet_id: petId,
        p_appointment_date: "2025-12-02",
        p_appointment_time: "14:00",
      },
    );

    expect(cancelError).toBeNull();

    const { error } = await supabase.rpc("fn_cancel_appointment", {
      p_caller_id: ownerUserId,
      p_appointment_id: (cancelApt as any).id,
      p_reason: "Testing cancellation",
    });

    expect(error).toBeNull();

    const { data: apt } = await supabase
      .from("appointments")
      .select("status")
      .eq("id", (cancelApt as any).id)
      .single();

    expect(apt!.status).toBe("CANCELLED");
  });
});
