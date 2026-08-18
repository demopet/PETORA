export default function PortalAppointmentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p className="mt-2 text-sm text-slate-600">Pilih hewan, tanggal, dan jam untuk membuat janji konsultasi.</p>

      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium">Pilih Hewan</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
              Buddy
            </button>
            <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
              Mimi
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tanggal</label>
          <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Jam</label>
          <div className="flex flex-wrap gap-2">
            {['09:00', '10:00', '11:00', '13:00', '14:00'].map((time) => (
              <button key={time} type="button" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
                {time}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="w-full rounded-xl bg-primary-600 px-4 py-2.5 font-medium text-white">
          Booking Baru
        </button>
      </div>
    </div>
  )
}
