import { Card } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access Petora
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="label">PIN</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your 6-digit PIN"
              maxLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Login
          </button>
        </form>
      </Card>
    </div>
  )
}
