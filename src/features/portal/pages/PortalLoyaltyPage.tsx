export default function PortalLoyaltyPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Rewards</h1>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Total poin Anda</p>
        <p className="mt-2 text-3xl font-bold text-primary-700">2,450</p>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-medium">Platinum Member</p>
            <p className="text-sm text-slate-600">Bonus konsultasi 10% untuk bulan ini.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-medium">Redeem 1,000 poin</p>
            <p className="text-sm text-slate-600">Diskon 10% untuk layanan grooming.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
