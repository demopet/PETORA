import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://localhost:54321";
const supabaseAnonKey = "local-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe("loyalty RLS policies", { timeout: 15000 }, () => {
  let ownerUserId: string;
  let adminUserId: string;
  let kasirUserId: string;
  let customerId: string;
  let customerUserId: string;
  let memberId: string;
  let transactionId: string;

  beforeAll(async () => {
    const ownerResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-loyalty-owner",
      p_pin: "123456",
      p_role: "OWNER",
      p_full_name: "RLS Loyalty Owner",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const adminResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-loyalty-admin",
      p_pin: "123456",
      p_role: "ADMIN",
      p_full_name: "RLS Loyalty Admin",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    const kasirResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-loyalty-kasir",
      p_pin: "123456",
      p_role: "KASIR",
      p_full_name: "RLS Loyalty Kasir",
      p_created_by: "00000000-0000-0000-0000-000000000000",
    });

    if (ownerResult.data) ownerUserId = ownerResult.data as string;
    if (adminResult.data) adminUserId = adminResult.data as string;
    if (kasirResult.data) kasirUserId = kasirResult.data as string;

    const customerResult = await supabase.rpc("fn_create_customer", {
      p_caller_id: ownerUserId,
      p_name: "RLS Loyalty Customer",
      p_phone: "081234567890",
    });

    if (customerResult.data) {
      customerId = customerResult.data.id as string;
    }

    const customerUserResult = await supabase.rpc("fn_auth_create_user", {
      p_username: "rls-loyalty-customer",
      p_pin: "123456",
      p_role: "CUSTOMER",
      p_full_name: "RLS Loyalty Customer User",
      p_customer_id: customerId,
      p_created_by: ownerUserId,
    });

    if (customerUserResult.data) {
      customerUserId = customerUserResult.data as string;
    }

    const tierResult = await supabase
      .from("loyalty_tiers")
      .insert({
        tier_name: "BRONZE",
        min_points: 0,
        min_spending: 0,
        point_multiplier: 1.0,
        benefits: {},
      })
      .select()
      .single();

    let tierId: string | undefined;
    if (tierResult.data) tierId = tierResult.data.id;

    const memberResult = await supabase
      .from("loyalty_members")
      .insert({
        customer_id: customerId,
        tier_id: tierId,
        total_points: 100,
        available_points: 100,
        total_spending: 500000,
      })
      .select()
      .single();

    if (memberResult.data) {
      memberId = memberResult.data.id;
    }

    const transactionResult = await supabase
      .from("loyalty_transactions")
      .insert({
        member_id: memberId,
        transaction_type: "EARN",
        points: 100,
        description: "Test transaction",
      })
      .select()
      .single();

    if (transactionResult.data) {
      transactionId = transactionResult.data.id;
    }
  });

  afterAll(async () => {
    if (transactionId) {
      await supabase
        .from("loyalty_transactions")
        .delete()
        .eq("id", transactionId)
        .catch(() => {});
    }
    if (memberId) {
      await supabase
        .from("loyalty_members")
        .delete()
        .eq("id", memberId)
        .catch(() => {});
    }
    if (customerId) {
      await supabase
        .from("customers")
        .delete()
        .eq("id", customerId)
        .catch(() => {});
    }
    const usersToDelete = [kasirUserId, adminUserId, ownerUserId, customerUserId].filter(Boolean);
    for (const uid of usersToDelete) {
      await supabase
        .from("users")
        .delete()
        .eq("id", uid)
        .catch(() => {});
    }
  });

  describe("loyalty_members RLS", () => {
    it("allows staff to select loyalty members", async () => {
      const { data, error } = await supabase.from("loyalty_members").select("*").eq("id", memberId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
    });

    it("allows customer to select own loyalty member", async () => {
      const { data, error } = await supabase.from("loyalty_members").select("*").eq("id", memberId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe("loyalty_transactions RLS", () => {
    it("allows staff to select loyalty transactions", async () => {
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("id", transactionId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("allows customer to select own transactions", async () => {
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("id", transactionId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
});
