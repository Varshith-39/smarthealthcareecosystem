import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Smart Healthcare Ecosystem...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = (user.role || '').toUpperCase();
    const authorized = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);
    if (!authorized) {
      if (userRole === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
      if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
