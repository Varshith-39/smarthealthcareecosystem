import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import AIAssistantPage from './pages/patient/AIAssistantPage';
import DoctorsListPage from './pages/patient/DoctorsListPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import MedicinesPage from './pages/patient/MedicinesPage';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import PatientMessagesPage from './pages/patient/PatientMessagesPage';
import EmergencySOSPage from './pages/patient/EmergencySOSPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorMedicalRecordsPage from './pages/doctor/DoctorMedicalRecordsPage';
import MyPatientsPage from './pages/doctor/MyPatientsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorMessagesPage from './pages/doctor/DoctorMessagesPage';
import DoctorEmergencyPage from './pages/doctor/DoctorEmergencyPage';
import DoctorAnalyticsPage from './pages/doctor/DoctorAnalyticsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import TelemedicineRoomPage from './pages/shared/TelemedicineRoomPage';

// Simple fallback router helper for default role routing
const RoleHomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/patient" element={<RegisterPage defaultRole="PATIENT" />} />
              <Route path="/register/doctor" element={<RegisterPage defaultRole="DOCTOR" />} />

              {/* Protected Routes inside MainLayout (Sidebar + Navbar) */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Patient Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/ai-assistant"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                {/* Smooth redirect for removed legacy health route */}
                <Route
                  path="/patient/health"
                  element={<Navigate to="/patient/ai-assistant" replace />}
                />
                <Route
                  path="/patient/doctors"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <DoctorsListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <AppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/medicines"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <MedicinesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/records"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/messages"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <PatientMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/emergency"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <EmergencySOSPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/profile"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <MyPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/records"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorMedicalRecordsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Smooth redirect for removed legacy monitoring route */}
                <Route
                  path="/doctor/monitoring"
                  element={<Navigate to="/doctor/records" replace />}
                />
                <Route
                  path="/doctor/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorPrescriptionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/messages"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/emergency"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorEmergencyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/profile"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/emergency"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditPage />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Routes */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/consultation/:roomId" element={<TelemedicineRoomPage />} />

                {/* Dashboard root alias */}
                <Route path="/dashboard" element={<RoleHomeRedirect />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
