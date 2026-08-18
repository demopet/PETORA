export default function PortalShopPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Shop</h1>
      <p className="mt-2 text-sm text-slate-600">Belanja kebutuhan hewan peliharaan dengan checkout yang mudah.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {['Whiskas', 'Vitamin', 'Makanan Kering', 'Toys'].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 h-20 rounded-xl bg-slate-200" />
            <p className="font-semibold">{item}</p>
            <p className="mt-1 text-sm text-slate-600">Rp 45.000</p>
            <button type="button" className="mt-3 w-full rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700">
              + Keranjang
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
