import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import HomePage from './pages/HomePage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

import AdminDashboard from './pages/AdminDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import AIChatWidget from './components/AIChatWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Layout wrapper for authenticated CRM dashboard
const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#FBFBF9] text-[#1A1A1A]">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
      <AIChatWidget />
    </div>
  );
};

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
        <div className="w-10 h-10 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const defaultDashboard = user?.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<Navigate to="/" replace />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Staff Dashboard Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requireRole="staff">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

export default App;
