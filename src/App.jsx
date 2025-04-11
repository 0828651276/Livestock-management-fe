import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import { authService } from './services/authService';

// Protected route component to check authentication
const ProtectedRoute = ({ element }) => {
  const token = authService.getCurrentUser();
  return token ? element : <Navigate to="/" />;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getCurrentUser();
    setAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={authenticated ? <Navigate to="/dashboard" /> : <MainLayout />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;