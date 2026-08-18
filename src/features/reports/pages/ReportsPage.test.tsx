import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ReportsPage from "./ReportsPage";

const mockUseRevenueReport = vi.fn();
const mockUseProfitLossReport = vi.fn();
const mockUseInventoryValuationReport = vi.fn();

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("../hooks/use-reports", () => ({
  useRevenueReport: () => mockUseRevenueReport(),
  useProfitLossReport: () => mockUseProfitLossReport(),
  useInventoryValuationReport: () => mockUseInventoryValuationReport(),
}));

describe("ReportsPage", () => {
  beforeEach(() => {
    mockUseRevenueReport.mockReturnValue({
      data: [
        {
          period: "2026-08-18",
          invoice_type: "POS",
          total_revenue: 500000,
          transaction_count: 5,
        },
      ],
      isLoading: false,
      error: null,
    });

    mockUseProfitLossReport.mockReturnValue({
      data: {
        revenue: 1000000,
        cogs: 400000,
        expenses: 200000,
        net_profit: 400000,
      },
      isLoading: false,
      error: null,
    });

    mockUseInventoryValuationReport.mockReturnValue({
      data: {
        total_value: 5000000,
        items: [
          {
            product_id: "prod-1",
            product_name: "Test Product",
            sku: "SKU-001",
            stock_quantity: 50,
            purchase_price: 100000,
            total_value: 5000000,
          },
        ],
      },
      isLoading: false,
      error: null,
    });
  });

  it("renders report tabs", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Profit & Loss")).toBeInTheDocument();
    expect(screen.getByText("Inventory Valuation")).toBeInTheDocument();
  });

  it("renders revenue report by default", () => {
    render(<ReportsPage />);

    expect(screen.getAllByText("Total Revenue").length).toBeGreaterThan(0);
    expect(screen.getByText("Revenue Details")).toBeInTheDocument();
  });

  it("renders date filters", () => {
    render(<ReportsPage />);

    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
  });

  it("renders export button", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Export CSV")).toBeInTheDocument();
  });
});
