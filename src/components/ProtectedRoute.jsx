import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Authenticating...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, storing original location to redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect non-admins to a 403 Forbidden page or home
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
