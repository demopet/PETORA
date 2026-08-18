import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/types/user";

interface TopBarProps {
  userName: string;
  userRole: UserRole;
}

export default function TopBar({ userName, userRole }: TopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Petora</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-slate-500" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">{userName}</div>
            <div className="text-xs text-slate-500">{userRole}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-4 w-4" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
