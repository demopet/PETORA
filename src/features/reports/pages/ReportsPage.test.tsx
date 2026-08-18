import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ReportsPage from "./ReportsPage";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: (options: unknown) => mockUseQuery(options),
  };
});

describe("ReportsPage", () => {
  beforeEach(() => {
    mockUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "customers") {
        return {
          data: [{ id: "1" }, { id: "2" }, { id: "3" }],
          isLoading: false,
          error: null,
        };
      }

      if (queryKey[0] === "pets") {
        return {
          data: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
          isLoading: false,
          error: null,
        };
      }

      if (queryKey[0] === "appointments") {
        return {
          data: [{ id: "a1" }, { id: "a2" }],
          isLoading: false,
          error: null,
        };
      }

      if (queryKey[0] === "reports" && queryKey[1] === "revenue") {
        return {
          data: [
            { total_amount: 500000, created_at: "2026-08-01" },
            { total_amount: 750000, created_at: "2026-08-02" },
          ],
          isLoading: false,
          error: null,
        };
      }

      return { data: [], isLoading: false, error: null };
    });
  });

  it("renders real customer and pet totals instead of placeholder zeros", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Pets")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/Revenue Details/i)).toBeInTheDocument();
  });
});
