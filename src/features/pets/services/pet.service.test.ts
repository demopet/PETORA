import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPet, updatePet, deletePet, AppError } from "./pet.service";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

const mockSupabaseRpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pet.service", () => {
  describe("createPet", () => {
    it("should call fn_create_pet with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: { id: "pet-1" },
        error: null,
      } as any);

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "pet-1", name: "Buddy" },
              error: null,
            } as any),
          })),
        })),
      }));
      vi.mocked(supabase).from = mockFrom as any;

      const result = await createPet(
        {
          customer_id: "00000000-0000-0000-0000-000000000000",
          name: "Buddy",
          species: "Dog",
          breed: "Golden Retriever",
        },
        "user-1",
      );

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_create_pet", {
        p_caller_id: "user-1",
        p_customer_id: "00000000-0000-0000-0000-000000000000",
        p_name: "Buddy",
        p_species: "Dog",
        p_breed: "Golden Retriever",
        p_birth_date: null,
        p_gender: null,
        p_photo_url: null,
        p_microchip_number: null,
      });
      expect(result).toEqual({ id: "pet-1", name: "Buddy" });
    });

    it("should throw AppError on RPC failure", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(
        createPet(
          {
            customer_id: "00000000-0000-0000-0000-000000000000",
            name: "Buddy",
            species: "Dog",
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("updatePet", () => {
    it("should call fn_update_pet with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({
        data: { id: "pet-1" },
        error: null,
      } as any);

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "pet-1", name: "Updated" },
              error: null,
            } as any),
          })),
        })),
      }));
      vi.mocked(supabase).from = mockFrom as any;

      const result = await updatePet(
        "pet-1",
        { name: "Updated Name", species: "Dog" },
        "user-1",
      );

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_update_pet", {
        p_caller_id: "user-1",
        p_pet_id: "pet-1",
        p_name: "Updated Name",
        p_species: "Dog",
        p_breed: null,
        p_birth_date: null,
        p_gender: null,
        p_photo_url: null,
        p_microchip_number: null,
      });
      expect(result).toEqual({ id: "pet-1", name: "Updated" });
    });
  });

  describe("deletePet", () => {
    it("should call fn_delete_pet with correct parameters", async () => {
      mockSupabaseRpc.mockResolvedValueOnce({ data: null, error: null } as any);

      await deletePet("pet-1", "user-1");

      expect(mockSupabaseRpc).toHaveBeenCalledWith("fn_delete_pet", {
        p_caller_id: "user-1",
        p_pet_id: "pet-1",
      });
    });
  });
});
