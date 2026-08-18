import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useConvertGuest } from "../hooks/use-customers";
import { toast } from "sonner";
import type { Pet } from "@/types/pet";
import { useCustomers } from "../hooks/use-customers";
import { usePets } from "@/features/pets/hooks/use-pets";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { StatCard } from "@/components/ui/stat-card";
import { Timeline } from "@/components/data-display/timeline";
import { formatCurrency } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/format";

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customers } = useCustomers();
  const customer = customers?.find((c) => c.id === customerId);
  const { data: pets = [] } = usePets(customerId);
  const { data: appointments = [] } = useAppointments();
  const { data: invoices = [] } = useInvoices();
  const convertGuestMutation = useConvertGuest({ callerUserId: user?.id });

  const [convertOpen, setConvertOpen] = useState(false);
  const [convertUsername, setConvertUsername] = useState("");
  const [convertPin, setConvertPin] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  if (!customerId) {
    return (
      <div className="space-y-6">
        <div className="text-danger-500">Customer ID not found</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/customers")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-danger-500">Customer not found</div>
      </div>
    );
  }

  const customerAppointments = appointments.filter((a) => a.customer_id === customerId);
  const customerInvoices = invoices.filter((inv) => inv.customer_id === customerId);
  const totalSpent = customerInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const petColumns = [
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: ({ original }: { original: Pet }) => (
        <div className="font-medium text-slate-900">{original.name}</div>
      ),
    },
    {
      header: "Species",
      accessorKey: "species" as const,
    },
    {
      header: "Breed",
      accessorKey: "breed" as const,
      cell: ({ original }: { original: Pet }) => original.breed || "-",
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: ({ original }: { original: Pet }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/pets/${original.id}`)}>
          View
        </Button>
      ),
    },
  ];

  const appointmentColumns = [
    {
      header: "Date",
      accessorKey: "appointment_date" as const,
    },
    {
      header: "Time",
      accessorKey: "appointment_time" as const,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: (typeof appointments)[0] }) => (
        <StatusBadge status={original.status} />
      ),
    },
  ];

  const invoiceColumns = [
    {
      header: "Invoice",
      accessorKey: "invoice_number" as const,
    },
    {
      header: "Date",
      accessorKey: "created_at" as const,
      cell: ({ original }: { original: (typeof invoices)[0] }) =>
        formatDateTime(original.created_at),
    },
    {
      header: "Total",
      accessorKey: "total_amount" as const,
      cell: ({ original }: { original: (typeof invoices)[0] }) =>
        formatCurrency(original.total_amount),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: ({ original }: { original: (typeof invoices)[0] }) => (
        <StatusBadge status={original.status} />
      ),
    },
  ];

  const tagColors: Record<string, string> = {
    VIP: "bg-purple-100 text-purple-700",
    REGULAR: "bg-blue-100 text-blue-700",
    NEW: "bg-green-100 text-green-700",
    BLACKLIST: "bg-red-100 text-red-700",
  };

  const handleConvertClick = () => {
    setConvertUsername("");
    setConvertPin("");
    setConvertOpen(true);
  };

  const handleConvertSubmit = async () => {
    if (!convertUsername && !convertPin) {
      toast.error("Please provide both username and PIN to create an account.");
      return;
    }
    if (convertUsername && !convertPin) {
      toast.error("Please provide a PIN.");
      return;
    }
    if (!convertUsername && convertPin) {
      toast.error("Please provide a username.");
      return;
    }
    try {
      await convertGuestMutation.mutateAsync({
        customerId: customer.id,
        username: convertUsername,
        pin: convertPin,
      });
      toast.success("Customer converted to registered successfully.");
      setConvertOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to convert customer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/customers")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${tagColors[tag] || "bg-gray-100 text-gray-700"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={customer.is_active ? "ACTIVE" : "ARCHIVED"} />
          {customer.is_guest && (
            <Button variant="outline" size="sm" onClick={handleConvertClick} className="gap-2">
              <UserCheck className="h-4 w-4" />
              Convert to Registered
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 rounded-lg bg-white p-6 shadow-sm md:grid-cols-4">
        <StatCard title="Total Pets" value={String(pets.length)} />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} />
        <StatCard title="Appointments" value={String(customerAppointments.length)} />
        <StatCard title="Invoices" value={String(customerInvoices.length)} />
      </div>

      <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex gap-1">
            <button
              key="overview"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              key="pets"
              onClick={() => setActiveTab("pets")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pets"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Pets ({pets.length})
            </button>
            <button
              key="appointments"
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "appointments"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Appointments
            </button>
            <button
              key="invoices"
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "invoices"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Invoices
            </button>
          </div>
        </div>
        <div className="pt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase">
                      Basic Information
                    </p>
                    <div className="mt-4 space-y-4">
                      {customer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-slate-900 hover:text-primary-600"
                          >
                            {customer.phone}
                          </a>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-slate-900 hover:text-primary-600"
                          >
                            {customer.email}
                          </a>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                          <p className="text-slate-900">{customer.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase">
                      Additional Information
                    </p>
                    <div className="mt-4 space-y-4">
                      {customer.emergency_contact && (
                        <div>
                          <p className="text-xs text-slate-500">Emergency Contact</p>
                          <p className="text-slate-900">{customer.emergency_contact}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500">Customer Type</p>
                        <p className="text-slate-900">
                          {customer.is_guest ? "Guest" : "Registered"}
                        </p>
                      </div>
                      {customer.notes && (
                        <div>
                          <p className="text-xs text-slate-500">Notes</p>
                          <p className="text-slate-900">{customer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                <Timeline
                  items={customerAppointments.slice(0, 5).map((a) => ({
                    date: a.appointment_date,
                    title: `Appointment ${a.status}`,
                    description: `At ${a.appointment_time} with ${a.customer_id}`,
                  }))}
                />
              </div>
            </div>
          )}
          {activeTab === "pets" && (
            <DataTable
              columns={petColumns}
              data={pets}
              searchKey="name"
              emptyState={<div>No pets found</div>}
            />
          )}
          {activeTab === "appointments" && (
            <DataTable
              columns={appointmentColumns}
              data={customerAppointments}
              emptyState={<div>No appointments found</div>}
            />
          )}
          {activeTab === "invoices" && (
            <DataTable
              columns={invoiceColumns}
              data={customerInvoices}
              emptyState={<div>No invoices found</div>}
            />
          )}
        </div>
      </div>

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Registered Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Converting <strong>{customer.name}</strong> from guest to registered. You can
              optionally create a user account for them.
            </p>
            <FormField label="Username (optional)">
              <Input
                value={convertUsername}
                onChange={(e) => setConvertUsername(e.target.value)}
                placeholder="Enter username for new account"
              />
            </FormField>
            <FormField label="PIN (6 digits, optional)">
              <Input
                type="password"
                value={convertPin}
                onChange={(e) => setConvertPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertSubmit}>Convert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
