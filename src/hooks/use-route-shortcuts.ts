import { useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function useNavigationShortcuts() {
  const navigate = useNavigate();

  const shortcuts = [
    { key: "g d", callback: () => navigate("/dashboard"), description: "Go to Dashboard" },
    { key: "g c", callback: () => navigate("/customers"), description: "Go to Customers" },
    { key: "g p", callback: () => navigate("/pets"), description: "Go to Pets" },
    { key: "g a", callback: () => navigate("/appointments"), description: "Go to Appointments" },
    { key: "g i", callback: () => navigate("/invoices"), description: "Go to Invoices" },
    { key: "g r", callback: () => navigate("/reports"), description: "Go to Reports" },
    { key: "g s", callback: () => navigate("/settings"), description: "Go to Settings" },
    { key: "g pos", callback: () => navigate("/pos"), description: "Go to POS" },
    { key: "g inv", callback: () => navigate("/inventory"), description: "Go to Inventory" },
  ];

  useKeyboardShortcuts(shortcuts);
}
