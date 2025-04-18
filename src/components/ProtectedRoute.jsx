// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ element, requiredRole }) => {
  const token = authService.getCurrentUser();
  const userRole = authService.getRole();
  
  // Kiểm tra đăng nhập
  if (!token) {
    return <Navigate to="/" />;
  }
  
  // Kiểm tra quyền
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

export default ProtectedRoute;