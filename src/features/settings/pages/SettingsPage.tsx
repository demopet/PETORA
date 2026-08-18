import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserManagementPage from "./UserManagementPage";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage users and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          <p className="mt-2 text-sm text-slate-500">
            Update your PIN to keep your account secure.
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <a href="/settings/change-pin">
                <KeyRound className="mr-2 h-4 w-4" />
                Change PIN
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <UserManagementPage />
      </div>
    </div>
  );
}
