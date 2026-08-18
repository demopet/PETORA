import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserManagementPage from './UserManagementPage'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    clinicName: 'Petora Clinic',
    clinicAddress: 'Jl. Contoh No. 123',
    clinicPhone: '021-12345678',
    taxRate: '11',
    currency: 'IDR',
    language: 'id',
  })

  const handleSave = () => {
    // Settings persist through the app’s real configuration layer in a production implementation.
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your clinic settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Clinic Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Clinic Name</label>
              <Input
                type="text"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Address</label>
              <Input
                type="text"
                value={settings.clinicAddress}
                onChange={(e) => setSettings({ ...settings, clinicAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <Input
                type="text"
                value={settings.clinicPhone}
                onChange={(e) => setSettings({ ...settings, clinicPhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">System Settings</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Tax Rate (%)</label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Currency</label>
              <Input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Language</label>
              <Input
                type="text"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <UserManagementPage />
      </div>
    </div>
  )
}
