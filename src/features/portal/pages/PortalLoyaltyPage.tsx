import { useState, type FormEvent } from "react";
import { History, Medal, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  usePortalLoyaltyMember,
  usePortalLoyaltyTransactions,
  useRedeemPortalLoyaltyPoints,
} from "../hooks/use-portal";
import { formatDate } from "@/lib/utils";

export default function PortalLoyaltyPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const callerUserId = user?.id ?? "";

  const { data: loyaltyMember, isLoading: memberLoading } = usePortalLoyaltyMember(customerId);
  const { data: transactions, isLoading: transactionsLoading } = usePortalLoyaltyTransactions(
    loyaltyMember?.id ?? ""
  );
  const redeemMutation = useRedeemPortalLoyaltyPoints(callerUserId);

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState("");

  const handleRedeem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerId || !pointsToRedeem) return;

    await redeemMutation.mutateAsync({
      customerId,
      pointsToRedeem: Number(pointsToRedeem),
    });

    setIsRedeemOpen(false);
    setPointsToRedeem("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Rewards</h1>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {memberLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ) : loyaltyMember ? (
          <>
            <p className="text-sm text-slate-600">Total poin Anda</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">
              {loyaltyMember.available_points.toLocaleString("id-ID")}
            </p>
            {loyaltyMember.loyalty_tiers && (
              <div className="mt-3 flex items-center gap-2">
                <Medal className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium uppercase tracking-wider text-primary-700">
                  {loyaltyMember.loyalty_tiers.tier_name}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600">Belum terdaftar dalam program loyalty.</p>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsRedeemOpen(!isRedeemOpen)}
            className="flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
          >
            <Sparkles className="h-4 w-4" />
            Tukar Poin
          </button>

          {isRedeemOpen && (
            <form onSubmit={handleRedeem} className="mt-3 space-y-3">
              <div>
                <label htmlFor="points-to-redeem" className="mb-2 block text-sm font-medium">
                  Jumlah Poin
                </label>
                <input
                  id="points-to-redeem"
                  type="number"
                  min="1"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  placeholder="Masukkan jumlah poin"
                  required
                />
                {loyaltyMember && (
                  <p className="mt-1 text-xs text-slate-500">
                    Poin tersedia: {loyaltyMember.available_points.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={redeemMutation.isPending}
                className="w-full rounded-xl bg-primary-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
              >
                {redeemMutation.isPending ? "Memproses..." : "Tukar Poin"}
              </button>
              {redeemMutation.isError && (
                <p className="text-sm text-red-600">{(redeemMutation.error as Error).message}</p>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-primary-600" />
          <h2 className="text-lg font-semibold">Transaksi</h2>
        </div>
        {transactionsLoading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {tx.transaction_type === "EARN"
                      ? "Poin Masuk"
                      : tx.transaction_type === "REDEEM"
                        ? "Poin Ditebus"
                        : tx.transaction_type === "EXPIRE"
                          ? "Poin Kadaluarsa"
                          : "Penyesuaian"}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                  {tx.description && <p className="text-xs text-slate-500">{tx.description}</p>}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.points > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {tx.points > 0 ? "+" : ""}
                  {tx.points.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Belum ada transaksi.</p>
        )}
      </div>
    </div>
  );
}
