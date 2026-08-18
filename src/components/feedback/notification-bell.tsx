import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";

function NotificationBell() {
  const { data: unread = [] } = useUnreadNotifications();
  const navigate = useNavigate();
  const unreadCount = unread.length;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell className="h-5 w-5 text-slate-500" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger-500 text-[10px] font-bold text-white flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
}

export { NotificationBell };
