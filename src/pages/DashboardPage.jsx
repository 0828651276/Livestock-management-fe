import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import TopMenu from "../components/layout/TopMenu.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { authService } from '../services/authService';
import { Outlet } from "react-router-dom";

const drawerWidth = 240;

function DashboardPage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [user, setUser] = useState({ username: '' });

    useEffect(() => {
        const token = authService.getCurrentUser();
        if (!token) {
            window.location.href = '/';
        } else {
            const userInfo = authService.getUserInfo();
            if (userInfo) setUser(userInfo);
            setLoading(false);
        }
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <TopMenu drawerWidth={drawerWidth} handleDrawerToggle={handleDrawerToggle} user={user} />
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Sidebar
                    drawerWidth={drawerWidth}
                    mobileOpen={mobileOpen}
                    handleDrawerToggle={handleDrawerToggle}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                />
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 10,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardPage;