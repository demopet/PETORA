import { describe, it, expect } from "vitest";
import type { Customer, Pet, Appointment, Product, Invoice } from "@/types";

describe("types", () => {
  it("has correct Customer shape", () => {
    const customer: Customer = {
      id: "1",
      name: "John Doe",
      phone: "081234567890",
      email: "john@example.com",
      address: null,
      emergency_contact: null,
      photo_url: null,
      notes: null,
      is_guest: false,
      tags: ["VIP"],
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      deleted_at: null,
    };
    expect(customer.name).toBe("John Doe");
  });

  it("has correct Pet shape", () => {
    const pet: Pet = {
      id: "1",
      customer_id: "1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      birth_date: "2020-01-01",
      gender: "Male",
      photo_url: null,
      microchip_number: null,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      deleted_at: null,
    };
    expect(pet.name).toBe("Buddy");
  });

  it("has correct Appointment shape", () => {
    const appointment: Appointment = {
      id: "1",
      customer_id: "1",
      pet_id: "1",
      doctor_id: null,
      appointment_date: "2025-01-15",
      appointment_time: "10:00",
      queue_number: 1,
      status: "WAITING",
      complaint: "Checkup",
      notes: null,
      is_from_portal: false,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };
    expect(appointment.status).toBe("WAITING");
  });

  it("has correct Product shape", () => {
    const product: Product = {
      id: "1",
      sku: "PROD-001",
      name: "Dog Food",
      category_id: null,
      supplier_id: null,
      barcode: null,
      description: null,
      purchase_price: 50000,
      selling_price: 75000,
      stock_quantity: 100,
      stock_minimum: 10,
      stock_maximum: 200,
      photo_url: null,
      expiry_date: null,
      status: "ACTIVE",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      deleted_at: null,
    };
    expect(product.sku).toBe("PROD-001");
  });

  it("has correct Invoice shape", () => {
    const invoice: Invoice = {
      id: "1",
      invoice_number: "INV-001",
      invoice_type: "POS",
      customer_id: "1",
      subtotal: 100000,
      discount_amount: 0,
      tax_amount: 11000,
      total_amount: 111000,
      paid_amount: 0,
      status: "UNPAID",
      promotion_id: null,
      loyalty_points_earned: 0,
      loyalty_points_redeemed: 0,
      notes: null,
      created_by: "1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };
    expect(invoice.invoice_number).toBe("INV-001");
  });
});
