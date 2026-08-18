export default function PortalProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            IW
          </div>
          <div>
            <p className="font-semibold">Ibu Wati</p>
            <p className="text-sm text-slate-600">wati@email.com</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 p-3">
            Nomor telepon: +62 812-3456-7890
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            Alamat: Jl. Merdeka No. 10, Jakarta
          </div>
        </div>
      </div>
    </div>
  );
}
