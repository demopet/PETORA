import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("pets RLS policies", { timeout: 10000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let customerId: string;
  let petId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-pet-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Pet Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-pet-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Pet Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }
    if (adminResult.error) {
      console.error("Create admin error:", adminResult.error);
    }

    const ownerLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-pet-owner",
      p_pin: "123456",
    });

    if (ownerLogin.data) {
      ownerUserId = ownerLogin.data.user.id;
    }

    const adminLogin = await supabase.rpc("fn_auth_login", {
      p_username: "rls-pet-admin",
      p_pin: "123456",
    });

    if (adminLogin.data) {
      adminUserId = adminLogin.data.user.id;
    }

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Pet RLS Customer",
      p_phone: "081234567890",
    });

    if (customerData) {
      customerId = customerData.id as string;
    }
  });

  afterAll(async () => {
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

  it("authenticated users can select pets", async () => {
    const { data, error } = await supabase.from("pets").select("id, name");

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("owner can create pet via fn_create_pet", async () => {
    const { data, error } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "RLS Test Pet",
      p_species: "Cat",
      p_breed: "Persian",
    });

    if (error) {
      console.error("Create pet error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    petId = data!.id as string;
  });

  it("admin can create pet via fn_create_pet", async () => {
    const { data, error } = await supabase.rpc("fn_create_pet", {
      p_caller_id: adminUserId,
      p_customer_id: customerId,
      p_name: "RLS Admin Pet",
      p_species: "Dog",
      p_breed: "Husky",
    });

    if (error) {
      console.error("Create pet error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("non-staff cannot insert pet", async () => {
    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Customer for Pet Non-Staff Test",
    });

    const customerIdForNonStaff = customerResult.data!.id as string;

    const nonStaffResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-pet-nonstaff",
      p_pin: "123456",
      p_role: "CUSTOMER",
      p_full_name: "Non Staff",
      p_customer_id: customerIdForNonStaff,
      p_created_by: ownerUserId,
    });

    if (nonStaffResult.error) {
      console.error("Create non-staff error:", nonStaffResult.error);
    }

    expect(nonStaffResult.error).toBeNull();

    const { error } = await supabase.rpc("fn_create_pet", {
      p_caller_id: nonStaffResult.data!,
      p_customer_id: customerId,
      p_name: "Should Fail",
      p_species: "Dog",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("FORBIDDEN");

    await supabase
      .rpc("fn_delete_customer", {
        p_caller_id: ownerUserId,
        p_customer_id: customerIdForNonStaff,
      })
      .catch(() => {});
  });
});
