import { useState, useCallback, useMemo } from "react";
import { Download, FileText, BarChart3, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  useRevenueReport,
  useProfitLossReport,
  useInventoryValuationReport,
} from "../hooks/use-reports";
import type { RevenueReportItem, InventoryValuationReport } from "../services/report.service";

type ReportTab = "revenue" | "profit-loss" | "inventory";

function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;

  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const { user } = useAuth();

  const revenueQuery = useRevenueReport(startDate || "", endDate || "", "day", user?.id || "");
  const profitLossQuery = useProfitLossReport(startDate || "", endDate || "", user?.id || "");
  const inventoryQuery = useInventoryValuationReport(endDate || "", user?.id || "");

  const revenueData = useMemo(() => revenueQuery.data || [], [revenueQuery.data]);
  const profitLossData = profitLossQuery.data;
  const inventoryData = inventoryQuery.data;

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum: number, item: RevenueReportItem) => sum + item.total_revenue, 0),
    [revenueData]
  );

  const totalTransactions = useMemo(
    () =>
      revenueData.reduce((sum: number, item: RevenueReportItem) => sum + item.transaction_count, 0),
    [revenueData]
  );

  const handleExportRevenue = useCallback(() => {
    const rows = revenueData.map((item: RevenueReportItem) => ({
      period: item.period,
      invoice_type: item.invoice_type,
      total_revenue: item.total_revenue,
      transaction_count: item.transaction_count,
    }));
    exportToCsv("revenue_report", rows);
  }, [revenueData]);

  const handleExportProfitLoss = useCallback(() => {
    if (!profitLossData) return;
    const rows = [
      {
        metric: "Revenue",
        value: profitLossData.revenue,
      },
      {
        metric: "COGS",
        value: profitLossData.cogs,
      },
      {
        metric: "Expenses",
        value: profitLossData.expenses,
      },
      {
        metric: "Net Profit",
        value: profitLossData.net_profit,
      },
    ];
    exportToCsv("profit_loss_report", rows);
  }, [profitLossData]);

  const handleExportInventory = useCallback(() => {
    if (!inventoryData) return;
    const rows = inventoryData.items.map((item: InventoryValuationReport["items"][number]) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      stock_quantity: item.stock_quantity,
      purchase_price: item.purchase_price,
      total_value: item.total_value,
    }));
    exportToCsv("inventory_valuation_report", rows);
  }, [inventoryData]);

  const revenueColumns = [
    { header: "Period", accessorKey: "period" as const },
    { header: "Invoice Type", accessorKey: "invoice_type" as const },
    {
      header: "Total Revenue",
      accessorKey: "total_revenue" as const,
      cell: ({ original }: { original: RevenueReportItem }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.total_revenue)}
        </div>
      ),
    },
    {
      header: "Transactions",
      accessorKey: "transaction_count" as const,
    },
  ];

  const inventoryColumns = [
    { header: "Product", accessorKey: "product_name" as const },
    { header: "SKU", accessorKey: "sku" as const },
    {
      header: "Stock Qty",
      accessorKey: "stock_quantity" as const,
    },
    {
      header: "Purchase Price",
      accessorKey: "purchase_price" as const,
      cell: ({ original }: { original: InventoryValuationReport["items"][number] }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.purchase_price)}
        </div>
      ),
    },
    {
      header: "Total Value",
      accessorKey: "total_value" as const,
      cell: ({ original }: { original: InventoryValuationReport["items"][number] }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(original.total_value)}
        </div>
      ),
    },
  ];

  const getExportButton = () => {
    switch (activeTab) {
      case "revenue":
        return (
          <Button variant="outline" onClick={handleExportRevenue}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        );
      case "profit-loss":
        return (
          <Button variant="outline" onClick={handleExportProfitLoss}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        );
      case "inventory":
        return (
          <Button variant="outline" onClick={handleExportInventory}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        );
    }
  };

  const tabs = [
    { id: "revenue" as ReportTab, label: "Revenue", icon: BarChart3 },
    { id: "profit-loss" as ReportTab, label: "Profit & Loss", icon: DollarSign },
    { id: "inventory" as ReportTab, label: "Inventory Valuation", icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">View and export business reports</p>
        </div>
        {getExportButton()}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="report-start-date" className="label">
            Start Date
          </label>
          <Input
            id="report-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="report-end-date" className="label">
            End Date
          </label>
          <Input
            id="report-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalRevenue)}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatCard
              title="Transactions"
              value={String(totalTransactions)}
              icon={<FileText className="h-6 w-6" />}
            />
            <StatCard
              title="Period"
              value={startDate && endDate ? `${startDate} - ${endDate}` : "Select dates"}
              icon={<BarChart3 className="h-6 w-6" />}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Revenue Details</h2>
            <div className="mt-4">
              <DataTable
                columns={revenueColumns}
                data={revenueData}
                emptyState={
                  <div className="py-8 text-center text-sm text-slate-500">No data available</div>
                }
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "profit-loss" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Revenue"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(profitLossData?.revenue || 0)}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatCard
              title="COGS"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(profitLossData?.cogs || 0)}
              icon={<Package className="h-6 w-6" />}
            />
            <StatCard
              title="Expenses"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(profitLossData?.expenses || 0)}
              icon={<FileText className="h-6 w-6" />}
            />
            <StatCard
              title="Net Profit"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(profitLossData?.net_profit || 0)}
              icon={<BarChart3 className="h-6 w-6" />}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profit & Loss Details</h2>
            <div className="mt-4">
              <DataTable
                columns={[
                  { header: "Metric", accessorKey: "metric" as const },
                  {
                    header: "Value",
                    accessorKey: "value" as const,
                    cell: ({ original }: { original: { metric: string; value: number } }) => (
                      <div className="font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(original.value)}
                      </div>
                    ),
                  },
                ]}
                data={
                  profitLossData
                    ? [
                        { metric: "Revenue", value: profitLossData.revenue },
                        { metric: "COGS", value: profitLossData.cogs },
                        { metric: "Expenses", value: profitLossData.expenses },
                        { metric: "Net Profit", value: profitLossData.net_profit },
                      ]
                    : []
                }
                emptyState={
                  <div className="py-8 text-center text-sm text-slate-500">No data available</div>
                }
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Inventory Value"
              value={new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(inventoryData?.total_value || 0)}
              icon={<Package className="h-6 w-6" />}
            />
            <StatCard
              title="Items"
              value={String(inventoryData?.items?.length || 0)}
              icon={<BarChart3 className="h-6 w-6" />}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Inventory Valuation Details</h2>
            <div className="mt-4">
              <DataTable
                columns={inventoryColumns}
                data={inventoryData?.items || []}
                emptyState={
                  <div className="py-8 text-center text-sm text-slate-500">No data available</div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
