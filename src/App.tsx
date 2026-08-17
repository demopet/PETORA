import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

import CustomersPage from '@/features/customers/pages/CustomersPage'
import PetsPage from '@/features/pets/pages/PetsPage'
import AppointmentsPage from '@/features/appointments/pages/AppointmentsPage'
import MedicalRecordsPage from '@/features/medical-records/pages/MedicalRecordsPage'
import PetHotelPage from '@/features/pet-hotel/pages/PetHotelPage'
import GroomingPage from '@/features/grooming/pages/GroomingPage'
import ProductsPage from '@/features/products/pages/ProductsPage'
import InventoryPage from '@/features/inventory/pages/InventoryPage'
import PurchaseOrdersPage from '@/features/purchase-orders/pages/PurchaseOrdersPage'
import POSPage from '@/features/pos/pages/POSPage'
import InvoicesPage from '@/features/invoices/pages/InvoicesPage'
import CashShiftsPage from '@/features/cash-shifts/pages/CashShiftsPage'
import LoyaltyPage from '@/features/loyalty/pages/LoyaltyPage'
import PromotionsPage from '@/features/promotions/pages/PromotionsPage'
import ExpensesPage from '@/features/expenses/pages/ExpensesPage'
import ReportsPage from '@/features/reports/pages/ReportsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="pets" element={<PetsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="pet-hotel" element={<PetHotelPage />} />
        <Route path="grooming" element={<GroomingPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="cash-shifts" element={<CashShiftsPage />} />
        <Route path="loyalty" element={<LoyaltyPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/*" element={<SettingsPage />} />
      </Route>
      <Route path="/portal/*" element={<div>Customer Portal</div>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
