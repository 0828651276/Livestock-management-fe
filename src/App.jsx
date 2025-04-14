import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import { authService } from './services/authService';
import PigPenPage from "./pages/PigPenPage.jsx";
import EmployeeManager from './components/employee/EmployeeManager.jsx';
import EmployeeFormUpdate from "./components/employee/EmployeeFormUpdate.jsx";
import EmployeeFormCreate from "./components/employee/EmployeeFormCreate.jsx";
// Tạo theme tùy chỉnh
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E8449',
    },
    secondary: {
      main: '#E75A99',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

// Protected route component để kiểm tra xác thực
const ProtectedRoute = ({ element }) => {
  const token = authService.getCurrentUser();
  return token ? element : <Navigate to="/" />;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = authService.getCurrentUser();
    setAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={authenticated ? <Navigate to="/dashboard" /> : <MainLayout />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
          {/* Thêm các route khác ở đây nếu cần */}
          <Route path="/pigpens" element={<ProtectedRoute element={<PigPenPage />} />} />
          <Route path="/employees" element={<EmployeeManager />} />
          <Route path="/employees/update" element={<EmployeeFormUpdate />} />
          <Route path="/employees/edit" element={<EmployeeFormCreate />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;