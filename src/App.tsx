import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PortalRoute from "@/components/PortalRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import CustomersPage from "@/features/customers/pages/CustomersPage";
import CustomerDetailPage from "@/features/customers/pages/CustomerDetailPage";
import PetsPage from "@/features/pets/pages/PetsPage";
import PetDetailPage from "@/features/pets/pages/PetDetailPage";
import AppointmentsPage from "@/features/appointments/pages/AppointmentsPage";
import AppointmentDetailPage from "@/features/appointments/pages/AppointmentDetailPage";
import MedicalRecordsPage from "@/features/medical-records/pages/MedicalRecordsPage";
import MedicalRecordFormPage from "@/features/medical-records/pages/MedicalRecordFormPage";
import PetHotelPage from "@/features/pet-hotel/pages/PetHotelPage";
import GroomingPage from "@/features/grooming/pages/GroomingPage";
import ProductsPage from "@/features/products/pages/ProductsPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import PurchaseOrdersPage from "@/features/purchase-orders/pages/PurchaseOrdersPage";
import POSPage from "@/features/pos/pages/POSPage";
import InvoicesPage from "@/features/invoices/pages/InvoicesPage";
import CashShiftsPage from "@/features/cash-shifts/pages/CashShiftsPage";
import LoyaltyPage from "@/features/loyalty/pages/LoyaltyPage";
import PromotionsPage from "@/features/promotions/pages/PromotionsPage";
import ExpensesPage from "@/features/expenses/pages/ExpensesPage";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import PortalApp from "@/features/portal/PortalApp";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="pets" element={<PetsPage />} />
        <Route path="pets/:petId" element={<PetDetailPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route
          path="appointments/:appointmentId"
          element={<AppointmentDetailPage />}
        />
        <Route
          path="medical-records"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="medical-records/new"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <MedicalRecordFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="medical-records/:recordId"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <MedicalRecordFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="pet-hotel" element={<PetHotelPage />} />
        <Route path="grooming" element={<GroomingPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route
          path="inventory"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <PurchaseOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="pos" element={<POSPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="cash-shifts" element={<CashShiftsPage />} />
        <Route
          path="loyalty"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <LoyaltyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="promotions"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <PromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="expenses"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/*"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/portal/*"
        element={
          <PortalRoute>
            <PortalApp />
          </PortalRoute>
        }
      />
      <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
