import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAuth } from "@/features/auth/context/AuthContext";

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSearch = useCallback(() => {
    const searchButton = document.querySelector('[aria-label="Open search"]');
    (searchButton as HTMLButtonElement)?.click();
  }, []);

  const toggleSidebar = useCallback(() => {
    const sidebarToggle = document.querySelector('[aria-label="Toggle sidebar"]');
    (sidebarToggle as HTMLButtonElement)?.click();
  }, []);

  const toggleDarkMode = useCallback(() => {
    const darkToggle = document.querySelector('[aria-label="Toggle dark mode"]');
    (darkToggle as HTMLButtonElement)?.click();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  useKeyboardShortcuts([
    { key: "cmd+k", callback: handleSearch, description: "Open command palette" },
    { key: "cmd+b", callback: toggleSidebar, description: "Toggle sidebar" },
    { key: "cmd+d", callback: toggleDarkMode, description: "Toggle dark mode" },
    { key: "cmd+shift+l", callback: handleLogout, description: "Logout" },
    { key: "escape", callback: () => {}, description: "Close modals" },
  ]);
}
