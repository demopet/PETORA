import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PortalRoute from "@/components/PortalRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import { useGlobalKeyboardShortcuts } from "@/hooks/use-app-shortcuts";
import { useNavigationShortcuts } from "@/hooks/use-route-shortcuts";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const CustomersPage = lazy(() => import("@/features/customers/pages/CustomersPage"));
const CustomerDetailPage = lazy(() => import("@/features/customers/pages/CustomerDetailPage"));
const PetsPage = lazy(() => import("@/features/pets/pages/PetsPage"));
const PetDetailPage = lazy(() => import("@/features/pets/pages/PetDetailPage"));
const AppointmentsPage = lazy(() => import("@/features/appointments/pages/AppointmentsPage"));
const AppointmentDetailPage = lazy(
  () => import("@/features/appointments/pages/AppointmentDetailPage")
);
const MedicalRecordsPage = lazy(
  () => import("@/features/medical-records/pages/MedicalRecordsPage")
);
const MedicalRecordFormPage = lazy(
  () => import("@/features/medical-records/pages/MedicalRecordFormPage")
);
const PetHotelPage = lazy(() => import("@/features/pet-hotel/pages/PetHotelPage"));
const GroomingPage = lazy(() => import("@/features/grooming/pages/GroomingPage"));
const ProductsPage = lazy(() => import("@/features/products/pages/ProductsPage"));
const InventoryPage = lazy(() => import("@/features/inventory/pages/InventoryPage"));
const PurchaseOrdersPage = lazy(
  () => import("@/features/purchase-orders/pages/PurchaseOrdersPage")
);
const POSPage = lazy(() => import("@/features/pos/pages/POSPage"));
const InvoicesPage = lazy(() => import("@/features/invoices/pages/InvoicesPage"));
const CashShiftsPage = lazy(() => import("@/features/cash-shifts/pages/CashShiftsPage"));
const LoyaltyPage = lazy(() => import("@/features/loyalty/pages/LoyaltyPage"));
const PromotionsPage = lazy(() => import("@/features/promotions/pages/PromotionsPage"));
const ExpensesPage = lazy(() => import("@/features/expenses/pages/ExpensesPage"));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const ChangePinPage = lazy(() => import("@/features/settings/pages/ChangePinPage"));
const PortalApp = lazy(() => import("@/features/portal/PortalApp"));

function RouteSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

function App() {
  useLocation();
  useGlobalKeyboardShortcuts();
  useNavigationShortcuts();

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
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <CustomersPage />
            </Suspense>
          }
        />
        <Route
          path="customers/:customerId"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <CustomerDetailPage />
            </Suspense>
          }
        />
        <Route
          path="pets"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <PetsPage />
            </Suspense>
          }
        />
        <Route
          path="pets/:petId"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <PetDetailPage />
            </Suspense>
          }
        />
        <Route
          path="appointments"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <AppointmentsPage />
            </Suspense>
          }
        />
        <Route
          path="appointments/:appointmentId"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <AppointmentDetailPage />
            </Suspense>
          }
        />
        <Route
          path="medical-records"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <MedicalRecordsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="medical-records/new"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <MedicalRecordFormPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="medical-records/:recordId"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN", "DOKTER"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <MedicalRecordFormPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="pet-hotel"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <PetHotelPage />
            </Suspense>
          }
        />
        <Route
          path="grooming"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <GroomingPage />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <ProductsPage />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <InventoryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <PurchaseOrdersPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="pos"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <POSPage />
            </Suspense>
          }
        />
        <Route
          path="invoices"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <InvoicesPage />
            </Suspense>
          }
        />
        <Route
          path="cash-shifts"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <CashShiftsPage />
            </Suspense>
          }
        />
        <Route
          path="loyalty"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <LoyaltyPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="promotions"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <PromotionsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="expenses"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <ExpensesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <ReportsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/*"
          element={
            <ProtectedRoute requiredRole={["OWNER", "ADMIN"]}>
              <Suspense fallback={<RouteSkeleton />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/change-pin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteSkeleton />}>
                <ChangePinPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/portal/*"
        element={
          <PortalRoute>
            <Suspense fallback={<RouteSkeleton />}>
              <PortalApp />
            </Suspense>
          </PortalRoute>
        }
      />
      <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
