import { useState } from "react";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usePortalInvoices } from "../hooks/use-portal";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL_PAYMENT: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

export default function PortalInvoicesPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";

  const { data: invoices, isLoading } = usePortalInvoices(customerId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="mt-4 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <p className="mt-1 text-sm text-slate-600">Riwayat tagihan dan pembayaran Anda.</p>

      <div className="mt-5 space-y-3">
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between"
                onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
              >
                <div>
                  <p className="font-semibold">{invoice.invoice_number}</p>
                  <p className="text-sm text-slate-600">{formatDate(invoice.created_at)}</p>
                  <p className="text-sm text-slate-600">{formatCurrency(invoice.total_amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[invoice.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {invoice.status.replace("_", " ")}
                  </span>
                  {expandedId === invoice.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedId === invoice.id && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Diskon</span>
                        <span>-{formatCurrency(invoice.discount_amount)}</span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Pajak</span>
                        <span>{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dibayar</span>
                      <span>{formatCurrency(invoice.paid_amount)}</span>
                    </div>
                    {invoice.loyalty_points_earned > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Poin Earned</span>
                        <span>{invoice.loyalty_points_earned}</span>
                      </div>
                    )}
                    {invoice.loyalty_points_redeemed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Poin Redeemed</span>
                        <span>{invoice.loyalty_points_redeemed}</span>
                      </div>
                    )}
                  </div>

                  {invoice.status === "UNPAID" && (
                    <button
                      type="button"
                      className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2.5 font-medium text-white"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-600">Belum ada invoice.</p>
          </div>
        )}
      </div>
    </div>
  );
}
