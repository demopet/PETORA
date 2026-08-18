import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("pets integration", { timeout: 10000 }, () => {
  let ownerUserId: string;
  let customerId: string;
  let petId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "pet-test-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "Pet Test Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.error) {
      console.error("Create owner error:", ownerResult.error);
    }

    const { data: ownerData } = await supabase.rpc("fn_auth_login", {
      p_username: "pet-test-owner",
      p_pin: "123456",
    });

    if (ownerData) {
      ownerUserId = ownerData.user.id;
    }

    const { data: customerData } = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "Pet Integration Customer",
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

  it("creates a pet via fn_create_pet", async () => {
    const { data, error } = await supabase.rpc("fn_create_pet", {
      p_caller_id: ownerUserId,
      p_customer_id: customerId,
      p_name: "Buddy",
      p_species: "Dog",
      p_breed: "Golden Retriever",
      p_birth_date: "2020-01-15",
      p_gender: "Male",
      p_microchip_number: "CHIP-12345",
    });

    if (error) {
      console.error("Create pet error:", error);
    }

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.id).toBeDefined();
    petId = data!.id as string;
  });

  it("retrieves the created pet", async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.name).toBe("Buddy");
    expect(data!.species).toBe("Dog");
    expect(data!.breed).toBe("Golden Retriever");
    expect(data!.gender).toBe("Male");
    expect(data!.microchip_number).toBe("CHIP-12345");
  });

  it("updates the pet via fn_update_pet", async () => {
    const { error } = await supabase.rpc("fn_update_pet", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
      p_name: "Buddy Updated",
      p_species: "Dog",
      p_breed: "Labrador Retriever",
      p_weight_kg: 28.5,
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    expect(data!.name).toBe("Buddy Updated");
    expect(data!.breed).toBe("Labrador Retriever");
  });

  it("soft deletes the pet via fn_delete_pet", async () => {
    const { error } = await supabase.rpc("fn_delete_pet", {
      p_caller_id: ownerUserId,
      p_pet_id: petId,
    });

    expect(error).toBeNull();

    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    expect(data).toBeNull();
  });
});
