import React, {useState, useEffect} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import DashboardPage from './pages/DashboardPage';
import {authService} from './services/authService';
import EmployeeManager from './components/employee/EmployeeManager.jsx';
import EmployeeDetail from "./components/employee/EmployeeDetail.jsx";
import PigPenManager from "./components/pen/PenManager.jsx";
import ChangePasswordForm from './components/employee/ChangePasswordForm.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import Home from './pages/Home';
import UnauthorizedPage from './pages/UnauthorizedPage';

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
const ProtectedRoute = ({element}) => {
    const token = authService.getCurrentUser();
    return token ? element : <Navigate to="/login"/>;
};

// Role-based Protected Route để kiểm tra quyền
const RoleBasedRoute = ({element, requiredRole}) => {
    const token = authService.getCurrentUser();
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login"/>;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized"/>;
    }

    return element;
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
        <>
            <ThemeProvider theme={theme}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<UnauthorizedPage/>}/>

                    <Route path="/dashboard/*" element={<ProtectedRoute element={<DashboardPage/>}/>}>
                        <Route path="" element={<Home/>}/>

                        {/* Routes chỉ cho MANAGER */}
                        <Route path="employees" element={<RoleBasedRoute element={<EmployeeManager/>} requiredRole="MANAGER"/>}/>
                        <Route path="notifications" element={<RoleBasedRoute element={<div>Quản lý thông báo</div>} requiredRole="MANAGER"/>}/>

                        {/* Routes cho tất cả người dùng */}
                        <Route path="pigpens" element={<PigPenManager/>}/>
                        <Route path="animals" element={<div>Quản lý cá thể vật nuôi</div>}/>
                        <Route path="change-password" element={<ChangePasswordForm/>}/>
                        <Route path="employees/detail" element={<EmployeeDetail/>}/>
                    </Route>
                </Routes>
            </ThemeProvider>
        </>
    );
}

export default App;