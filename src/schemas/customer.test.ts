import { describe, it, expect } from "vitest";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerTagSchema,
} from "@/schemas/customer";

describe("customer schemas", () => {
  it("creates valid customer", () => {
    const result = createCustomerSchema.parse({
      name: "John Doe",
      phone: "081234567890",
      email: "john@example.com",
    });
    expect(result.name).toBe("John Doe");
  });

  it("rejects invalid email", () => {
    expect(() =>
      createCustomerSchema.parse({
        name: "John Doe",
        email: "invalid",
      }),
    ).toThrow();
  });

  it("updates customer partially", () => {
    const result = updateCustomerSchema.parse({
      name: "Jane Doe",
    });
    expect(result.name).toBe("Jane Doe");
  });

  it("accepts valid tags", () => {
    const result = customerTagSchema.parse("VIP");
    expect(result).toBe("VIP");
  });
});
