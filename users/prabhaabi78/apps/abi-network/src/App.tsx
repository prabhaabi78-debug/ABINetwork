import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import ChannelsPage from './pages/admin/ChannelsPage';
import CustomersPage from './pages/admin/CustomersPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import ViewerHomePage from './pages/viewer/HomePage';
import PlayerPage from './pages/viewer/PlayerPage';
import { useEffect } from 'react';

// Smart redirect based on role
function AuthRedirect() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Handled by routes below
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading ABI NETWORK...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/tv" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Smart redirect */}
      <Route path="/" element={<AuthRedirect />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/channels"
        element={
          <ProtectedRoute requireAdmin>
            <ChannelsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute requireAdmin>
            <CustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute requireAdmin>
            <SubscriptionsPage />
          </ProtectedRoute>
        }
      />

      {/* Viewer routes */}
      <Route
        path="/tv"
        element={
          <ProtectedRoute>
            <ViewerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tv/play/:channelId"
        element={
          <ProtectedRoute>
            <PlayerPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
