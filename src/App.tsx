import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

import CustomersPage from '@/features/customers/pages/CustomersPage'
import PetsPage from '@/features/pets/pages/PetsPage'
import AppointmentsPage from '@/features/appointments/pages/AppointmentsPage'
import ProductsPage from '@/features/products/pages/ProductsPage'
import InvoicesPage from '@/features/invoices/pages/InvoicesPage'

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
        <Route path="medical-records" element={<div>Medical Records</div>} />
        <Route path="pet-hotel" element={<div>Pet Hotel</div>} />
        <Route path="grooming" element={<div>Grooming</div>} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory" element={<div>Inventory</div>} />
        <Route path="purchase-orders" element={<div>Purchase Orders</div>} />
        <Route path="pos" element={<div>POS</div>} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="cash-shifts" element={<div>Cash Shifts</div>} />
        <Route path="loyalty" element={<div>Loyalty</div>} />
        <Route path="promotions" element={<div>Promotions</div>} />
        <Route path="expenses" element={<div>Expenses</div>} />
        <Route path="reports" element={<div>Reports</div>} />
        <Route path="settings/*" element={<div>Settings</div>} />
      </Route>
      <Route path="/portal/*" element={<div>Customer Portal</div>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
