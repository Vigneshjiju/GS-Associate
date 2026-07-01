import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Validating access credentials...</div>;
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
