import { Navigate, Route, Routes } from "react-router-dom";
import PortalLayout from "./PortalLayout";
import PortalHomePage from "./pages/PortalHomePage";
import PortalAppointmentsPage from "./pages/PortalAppointmentsPage";
import PortalShopPage from "./pages/PortalShopPage";
import PortalLoyaltyPage from "./pages/PortalLoyaltyPage";
import PortalProfilePage from "./pages/PortalProfilePage";
import PortalPetHotelPage from "./pages/PortalPetHotelPage";
import PortalGroomingPage from "./pages/PortalGroomingPage";
import PortalInvoicesPage from "./pages/PortalInvoicesPage";

export default function PortalApp() {
  return (
    <Routes>
      <Route element={<PortalLayout />}>
        <Route index element={<PortalHomePage />} />
        <Route path="appointments" element={<PortalAppointmentsPage />} />
        <Route path="pet-hotel" element={<PortalPetHotelPage />} />
        <Route path="grooming" element={<PortalGroomingPage />} />
        <Route path="shop" element={<PortalShopPage />} />
        <Route path="loyalty" element={<PortalLoyaltyPage />} />
        <Route path="invoices" element={<PortalInvoicesPage />} />
        <Route path="profile" element={<PortalProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}
