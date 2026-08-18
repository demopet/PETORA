import { NavLink } from "react-router-dom";
import {
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  Hotel,
  Scissors,
  Package,
  Warehouse,
  ShoppingCart,
  FileText,
  Receipt,
  Wallet,
  Award,
  Tag,
  TrendingUp,
  BarChart3,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/user";

interface SidebarProps {
  userRole: UserRole;
}

const menuItems = [
  {
    to: "/dashboard",
    icon: Home,
    label: "Dashboard",
    roles: ["OWNER", "ADMIN", "DOKTER", "KASIR"],
  },
  {
    to: "/customers",
    icon: Users,
    label: "Customers",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/pets",
    icon: PawPrint,
    label: "Pets",
    roles: ["OWNER", "ADMIN", "DOKTER", "KASIR"],
  },
  {
    to: "/appointments",
    icon: Calendar,
    label: "Appointments",
    roles: ["OWNER", "ADMIN", "DOKTER", "KASIR"],
  },
  {
    to: "/medical-records",
    icon: Stethoscope,
    label: "Medical Records",
    roles: ["OWNER", "ADMIN", "DOKTER"],
  },
  {
    to: "/pet-hotel",
    icon: Hotel,
    label: "Pet Hotel",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/grooming",
    icon: Scissors,
    label: "Grooming",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/products",
    icon: Package,
    label: "Products",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/inventory",
    icon: Warehouse,
    label: "Inventory",
    roles: ["OWNER", "ADMIN"],
  },
  {
    to: "/purchase-orders",
    icon: ShoppingCart,
    label: "Purchase Orders",
    roles: ["OWNER", "ADMIN"],
  },
  {
    to: "/pos",
    icon: Receipt,
    label: "POS",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/invoices",
    icon: FileText,
    label: "Invoices",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  {
    to: "/cash-shifts",
    icon: Wallet,
    label: "Cash Shifts",
    roles: ["OWNER", "ADMIN", "KASIR"],
  },
  { to: "/loyalty", icon: Award, label: "Loyalty", roles: ["OWNER", "ADMIN"] },
  {
    to: "/promotions",
    icon: Tag,
    label: "Promotions",
    roles: ["OWNER", "ADMIN"],
  },
  {
    to: "/expenses",
    icon: TrendingUp,
    label: "Expenses",
    roles: ["OWNER", "ADMIN"],
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports",
    roles: ["OWNER", "ADMIN"],
  },
  {
    to: "/settings",
    icon: Settings,
    label: "Settings",
    roles: ["OWNER", "ADMIN"],
  },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <PawPrint className="h-6 w-6 text-primary-600" />
        <span className="ml-2 text-lg font-bold text-slate-900">Petora</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="text-xs text-slate-500">Petora v0.1.0</div>
      </div>
    </aside>
  );
}
