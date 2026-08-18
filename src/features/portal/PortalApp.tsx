import { Navigate, Route, Routes } from 'react-router-dom'
import PortalHomePage from './pages/PortalHomePage'
import PortalAppointmentsPage from './pages/PortalAppointmentsPage'
import PortalShopPage from './pages/PortalShopPage'
import PortalLoyaltyPage from './pages/PortalLoyaltyPage'
import PortalProfilePage from './pages/PortalProfilePage'

export default function PortalApp() {
  return (
    <Routes>
      <Route index element={<PortalHomePage />} />
      <Route path="appointments" element={<PortalAppointmentsPage />} />
      <Route path="shop" element={<PortalShopPage />} />
      <Route path="loyalty" element={<PortalLoyaltyPage />} />
      <Route path="profile" element={<PortalProfilePage />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  )
}
