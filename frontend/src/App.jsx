import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { authService } from './services/authService';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import PortalSelect from './pages/PortalSelect';
import Login from './pages/Login';

// Dashboards
import PoliceDashboard from './pages/PoliceDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Evidence & Ledger
import EvidenceList from './pages/EvidenceList';
import UploadEvidence from './pages/UploadEvidence';
import EvidenceDetail from './pages/EvidenceDetail';
import CustodyVerification from './pages/CustodyVerification';
import LedgerExplorer from './pages/LedgerExplorer';
import Certificates from './pages/Certificates';
import Alerts from './pages/Alerts';

// Admin Modules
import AdminUsers from './pages/AdminUsers';
import AdminAudit from './pages/AdminAudit';
import AdminTools from './pages/AdminTools';

// Helper to route to user's assigned dashboard
function DashboardRedirect() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/portal" replace />;
  if (user.role === 'JUDGE') return <Navigate to="/judge/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/police/dashboard" replace />;
}

// Route Guard for Admin Only
function AdminRoute({ children }) {
  const user = authService.getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return <DashboardRedirect />;
  }
  return children;
}

// Route Guard for Evidence Upload (Restricted from Judges)
function UploadRoute({ children }) {
  const user = authService.getCurrentUser();
  if (user?.role === 'JUDGE') {
    return <Navigate to="/evidence" replace />;
  }
  return children;
}

function ProtectedLayout() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Routes>
          {/* Default authenticated redirect */}
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Role Dashboards */}
          <Route path="/police/dashboard" element={<PoliceDashboard />} />
          <Route path="/judge/dashboard" element={<JudgeDashboard />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Evidence Management */}
          <Route path="/evidence" element={<EvidenceList />} />
          <Route
            path="/evidence/upload"
            element={
              <UploadRoute>
                <UploadEvidence />
              </UploadRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <UploadRoute>
                <UploadEvidence />
              </UploadRoute>
            }
          />
          <Route path="/evidence/:id" element={<EvidenceDetail />} />

          {/* Verification & Custody Ledger */}
          <Route path="/custody" element={<CustodyVerification />} />
          <Route path="/ledger" element={<LedgerExplorer />} />
          <Route path="/nodes" element={<LedgerExplorer />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/alerts" element={<Alerts />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/alerts"
            element={
              <AdminRoute>
                <Alerts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AdminRoute>
                <AdminAudit />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tools"
            element={
              <AdminRoute>
                <AdminTools />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<DashboardRedirect />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal" element={<PortalSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/:role" element={<Login />} />

        {/* Protected Authenticated Routes */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
