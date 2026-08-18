import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/types/user";
import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";

interface TopBarProps {
  userName: string;
  userRole: UserRole;
  onToggleSidebar?: () => void;
}

export default function TopBar({ userName, userRole, onToggleSidebar }: TopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: customers } = useCustomers();
  const { data: pets } = usePets();
  const { data: appointments } = useAppointments();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredCustomers =
    customers?.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone && c.phone.includes(query))
    ) || [];
  const filteredPets =
    pets?.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())) || [];
  const filteredAppointments =
    appointments?.filter((a) => a.customer_id.toLowerCase().includes(query.toLowerCase())) || [];

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden lg:flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-slate-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-slate-500" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">Petora</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2 text-slate-500"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            ⌘K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger-500 text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
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
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <Command open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredCustomers.length > 0 && (
              <CommandGroup heading="Customers">
                {filteredCustomers.slice(0, 5).map((c) => (
                  <CommandItem
                    key={c.id}
                    onSelect={() => {
                      setSearchOpen(false);
                      navigate(`/customers/${c.id}`);
                    }}
                  >
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {filteredPets.length > 0 && (
              <CommandGroup heading="Pets">
                {filteredPets.slice(0, 5).map((p) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => {
                      setSearchOpen(false);
                      navigate(`/pets/${p.id}`);
                    }}
                  >
                    {p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {filteredAppointments.length > 0 && (
              <CommandGroup heading="Appointments">
                {filteredAppointments.slice(0, 5).map((a) => (
                  <CommandItem
                    key={a.id}
                    onSelect={() => {
                      setSearchOpen(false);
                      navigate(`/appointments/${a.id}`);
                    }}
                  >
                    {a.customer_id} - {a.appointment_time}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/dashboard");
                }}
              >
                Dashboard
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/customers");
                }}
              >
                Customers
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/appointments");
                }}
              >
                Appointments
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/pos");
                }}
              >
                POS
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/invoices");
                }}
              >
                Invoices
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/pets");
                }}
              >
                Pets
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/reports");
                }}
              >
                Reports
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  navigate("/settings");
                }}
              >
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </header>
  );
}
