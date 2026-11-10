import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import MarketplacePage from './pages/public/MarketplacePage';
import CropDetailsPage from './pages/public/CropDetailsPage';
import TransportEstimatorPage from './pages/public/TransportEstimatorPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutUsPage from './pages/public/AboutUsPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddCropPage from './pages/farmer/AddCropPage';
import MyListingsPage from './pages/farmer/MyListingsPage';
import FarmerOffersPage from './pages/farmer/FarmerOffersPage';
import CompareOffersPage from './pages/farmer/CompareOffersPage';
import FarmerSalesPage from './pages/farmer/FarmerSalesPage';
import FarmerSaleDetailsPage from './pages/farmer/FarmerSaleDetailsPage';
import FarmerMessagesPage from './pages/farmer/FarmerMessagesPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOffersPage from './pages/buyer/BuyerOffersPage';
import SavedCropsPage from './pages/buyer/SavedCropsPage';
import BuyerPurchasesPage from './pages/buyer/BuyerPurchasesPage';
import BuyerOrderDetailPage from './pages/buyer/BuyerOrderDetailPage';
import BuyerProfilePage from './pages/buyer/BuyerProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Layout wrapper for public pages with standard navbar & footer
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-cream">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public Pages with Standard Header/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/crops/:id" element={<CropDetailsPage />} />
        <Route path="/transport-estimator" element={<TransportEstimatorPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Farmer Portal Pages */}
      <Route
        path="/farmer/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['farmer', 'admin']}>
              <DashboardLayout title="Farmer Portal">
                <Routes>
                  <Route path="dashboard" element={<FarmerDashboard />} />
                  <Route path="add-crop" element={<AddCropPage />} />
                  <Route path="listings" element={<MyListingsPage />} />
                  <Route path="offers" element={<FarmerOffersPage />} />
                  <Route path="compare-offers" element={<CompareOffersPage />} />
                  <Route path="sales" element={<FarmerSalesPage />} />
                  <Route path="sales/:id" element={<FarmerSaleDetailsPage />} />
                  <Route path="messages" element={<FarmerMessagesPage />} />
                  <Route path="profile" element={<FarmerProfilePage />} />
                  <Route path="*" element={<FarmerDashboard />} />
                </Routes>
              </DashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Buyer Portal Pages */}
      <Route
        path="/buyer/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['buyer', 'admin']}>
              <DashboardLayout title="Commercial Buyer Portal">
                <Routes>
                  <Route path="dashboard" element={<BuyerDashboard />} />
                  <Route path="offers" element={<BuyerOffersPage />} />
                  <Route path="saved" element={<SavedCropsPage />} />
                  <Route path="purchases" element={<BuyerPurchasesPage />} />
                  <Route path="purchases/:id" element={<BuyerOrderDetailPage />} />
                  <Route path="messages" element={<FarmerMessagesPage />} />
                  <Route path="profile" element={<BuyerProfilePage />} />
                  <Route path="*" element={<BuyerDashboard />} />
                </Routes>
              </DashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin Portal Pages */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <DashboardLayout title="Admin Management Central">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="listings" element={<AdminListingsPage />} />
                  <Route path="transactions" element={<AdminTransactionsPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="*" element={<AdminDashboard />} />
                </Routes>
              </DashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
