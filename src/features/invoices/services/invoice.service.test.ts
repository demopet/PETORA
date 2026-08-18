import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRpc, mockFrom, mockAuthGetUser } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockAuthGetUser: vi
    .fn()
    .mockResolvedValue({ data: { user: { id: "user-1" } } }),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  },
}));

import {
  createInvoice,
  recordPayment,
  cancelInvoice,
  getDailySales,
  AppError,
} from "./invoice.service";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
  mockAuthGetUser.mockReset();
  mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

describe("invoice.service", () => {
  describe("createInvoice", () => {
    it("should call fn_create_invoice with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          id: "invoice-1",
          invoice_number: "INV-20250818-0001",
          invoice_type: "POS",
          customer_id: VALID_UUID,
          subtotal: 100000,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: 100000,
          paid_amount: 0,
          status: "UNPAID",
          promotion_id: null,
          loyalty_points_earned: 10,
          loyalty_points_redeemed: 0,
          notes: null,
          created_by: "user-1",
          created_at: "2025-08-18T00:00:00Z",
          updated_at: "2025-08-18T00:00:00Z",
          items: [],
        },
        error: null,
      } as any);

      const result = await createInvoice(
        {
          invoice_type: "POS",
          customer_id: VALID_UUID,
          items: [
            {
              item_type: "PRODUCT",
              product_id: VALID_UUID,
              description: "Test Product",
              quantity: 1,
              unit_price: 100000,
            },
          ],
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_create_invoice", {
        p_caller_id: "user-1",
        p_invoice_type: "POS",
        p_customer_id: VALID_UUID,
        p_items: [
          {
            item_type: "PRODUCT",
            product_id: VALID_UUID,
            procedure_id: null,
            pet_hotel_booking_id: null,
            grooming_booking_id: null,
            description: "Test Product",
            quantity: 1,
            unit_price: 100000,
          },
        ],
        p_discount_amount: 0,
        p_tax_amount: 0,
        p_promotion_id: null,
        p_loyalty_points_to_redeem: 0,
        p_notes: null,
      });
      expect(result.id).toBe("invoice-1");
    });

    it("should throw AppError on RPC failure", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "FORBIDDEN", code: "42501" },
      } as any);

      await expect(
        createInvoice(
          {
            invoice_type: "POS",
            items: [
              {
                item_type: "PRODUCT",
                product_id: VALID_UUID,
                description: "Test",
                quantity: 1,
                unit_price: 100000,
              },
            ],
          },
          "user-1",
        ),
      ).rejects.toThrow(AppError);
    });

    it("should throw AppError with INSUFFICIENT_STOCK for stock errors", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: {
          message: "INSUFFICIENT_STOCK: Not enough stock for product",
          code: "22000",
        },
      } as any);

      try {
        await createInvoice(
          {
            invoice_type: "POS",
            items: [
              {
                item_type: "PRODUCT",
                product_id: VALID_UUID,
                description: "Test",
                quantity: 1,
                unit_price: 100000,
              },
            ],
          },
          "user-1",
        );
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe("INSUFFICIENT_STOCK");
      }
    });
  });

  describe("recordPayment", () => {
    it("should call fn_record_payment with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          payment: { id: "payment-1" },
          invoice: { id: "invoice-1", status: "PAID" },
        },
        error: null,
      } as any);

      const result = await recordPayment(
        "invoice-1",
        {
          invoice_id: "invoice-1",
          payment_method: "CASH",
          amount: 100000,
        },
        "user-1",
      );

      expect(mockRpc).toHaveBeenCalledWith("fn_record_payment", {
        p_caller_id: "user-1",
        p_invoice_id: "invoice-1",
        p_payment_method: "CASH",
        p_amount: 100000,
        p_reference_number: null,
        p_notes: null,
      });
      expect(result.payment).toEqual({ id: "payment-1" });
    });

    it("should throw AppError on INVOICE_CANCELLED", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "INVOICE_CANCELLED: Cannot record payment", code: "22000" },
      } as any);

      try {
        await recordPayment(
          "invoice-1",
          { invoice_id: "invoice-1", payment_method: "CASH", amount: 100000 },
          "user-1",
        );
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe("INVOICE_CANCELLED");
      }
    });
  });

  describe("cancelInvoice", () => {
    it("should call fn_cancel_invoice with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          id: "invoice-1",
          invoice_number: "INV-20250818-0001",
          status: "CANCELLED",
          updated_at: "2025-08-18T00:00:00Z",
        },
        error: null,
      } as any);

      const result = await cancelInvoice("invoice-1", "user-1", "Customer request");

      expect(mockRpc).toHaveBeenCalledWith("fn_cancel_invoice", {
        p_caller_id: "user-1",
        p_invoice_id: "invoice-1",
        p_reason: "Customer request",
      });
      expect(result.status).toBe("CANCELLED");
    });

    it("should call fn_cancel_invoice without reason", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { id: "invoice-1", status: "CANCELLED" },
        error: null,
      } as any);

      await cancelInvoice("invoice-1", "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_cancel_invoice", {
        p_caller_id: "user-1",
        p_invoice_id: "invoice-1",
        p_reason: null,
      });
    });
  });

  describe("getDailySales", () => {
    it("should call fn_get_daily_sales with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({
        data: {
          date: "2025-08-18",
          total_sales: 500000,
          total_transactions: 5,
          total_items: 12,
        },
        error: null,
      } as any);

      const result = await getDailySales("2025-08-18", "user-1");

      expect(mockRpc).toHaveBeenCalledWith("fn_get_daily_sales", {
        p_caller_id: "user-1",
        p_date: "2025-08-18",
      });
      expect(result.total_sales).toBe(500000);
      expect(result.total_transactions).toBe(5);
    });
  });
});
