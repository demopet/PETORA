import { Routes, Route, Navigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

function App() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    },
  })

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<div>Customers</div>} />
        <Route path="pets" element={<div>Pets</div>} />
        <Route path="appointments" element={<div>Appointments</div>} />
        <Route path="medical-records" element={<div>Medical Records</div>} />
        <Route path="pet-hotel" element={<div>Pet Hotel</div>} />
        <Route path="grooming" element={<div>Grooming</div>} />
        <Route path="products" element={<div>Products</div>} />
        <Route path="inventory" element={<div>Inventory</div>} />
        <Route path="purchase-orders" element={<div>Purchase Orders</div>} />
        <Route path="pos" element={<div>POS</div>} />
        <Route path="invoices" element={<div>Invoices</div>} />
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
