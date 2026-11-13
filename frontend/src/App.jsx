import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Stations } from './pages/Stations';
import { DataCollection } from './pages/DataCollection';
import { Alerts } from './pages/Alerts';
import { ReportManagement } from './pages/ReportManagement';
import { Users } from './pages/Users';
import { Thresholds } from './pages/Thresholds';
import { EnvironmentMap } from './pages/EnvironmentMap';
import { Profile } from './pages/Profile';
import { PublicMonitor } from './pages/PublicMonitor';
import './App.css';

const { Content } = Layout;

const getDefaultRouteForRole = (role) => {
  if (role === 'admin') return '/dashboard';
  if (role === 'staff') return '/reports';
  if (role === 'viewer') return '/monitor';
  return '/monitor';
};

// Role-based route protection wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', marginTop: '100px' }}>
        <h1>❌ 403 - Không Có Quyền Truy Cập</h1>
        <p>Bạn không có quyền xem trang này</p>
        <p>Vai trò của bạn: <strong>{user?.role}</strong></p>
        <Navigate to={getDefaultRouteForRole(user?.role)} replace />
      </div>
    );
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <Spin size="large" tip="Đang tải..." fullscreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-layout">
        <Routes>
          <Route path="/" element={<PublicMonitor />} />
          <Route path="/monitor" element={<PublicMonitor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/monitor" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Content className="main-content">
          <Routes>
            {/* Public routes - all authenticated users */}
            <Route path="/" element={<PublicMonitor />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/monitor" element={<PublicMonitor />} />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route path="/reports" element={<ReportManagement />} />
            <Route path="/map" element={<EnvironmentMap />} />
<Route path="/profile" element={<Profile />} />


            {/* Admin only routes */}
            <Route
              path="/stations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Stations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/thresholds"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Thresholds />
                </ProtectedRoute>
              }
            />

            {/* Staff routes */}
            <Route
              path="/data-collection"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <DataCollection />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to={getDefaultRouteForRole(user?.role)} replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
