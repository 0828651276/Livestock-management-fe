import React, {useState, useEffect} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import {authService} from './services/authService';
import EmployeeManager from './components/employee/EmployeeManager.jsx';
import EmployeeDetail from "./components/employee/EmployeeDetail.jsx";
import PigPenManager from "./components/pen/PenManager.jsx";
import ChangePasswordForm from './components/employee/ChangePasswordForm.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import Home from './pages/Home';

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
    return token ? element : <Navigate to="/"/>;
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

                    <Route element={<MainLayout/>}>
                        <Route path="/login" element={<LoginPage/>}/>
                    </Route>
                    <Route index element={authenticated ? <Navigate to="/dashboard"/> : <MainLayout/>}/>
                    <Route path="/dashboard/*" element={<ProtectedRoute element={<DashboardPage/>}/>}>
                        <Route path="" element={<Home/>}/>
                        <Route path="employees" element={<EmployeeManager/>}/>
                        <Route path="employees/detail" element={<EmployeeDetail/>}/>
                        <Route path="pigpens" element={<PigPenManager/>}/>
                        <Route path="change-password" element={<ChangePasswordForm/>}/>
                    </Route>

                </Routes>
            </ThemeProvider>
        </>
    );
}

export default App;