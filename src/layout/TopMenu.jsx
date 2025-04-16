import React, { useEffect, useState } from 'react';
import {
    Box, Container, Grid, Paper, Avatar,
    Toolbar, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import PetsIcon from '@mui/icons-material/Pets';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { authService } from '../services/authService';
import EmployeeManager from "../components/employee/EmployeeManager.jsx";
import PenManager from "../components/pen/PenManager.jsx";
import Sidebar from "../components/layout/Sidebar";
import TopMenu from "../components/layout/TopMenu";

const drawerWidth = 240;

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
    width: 80,
    height: 80,
    backgroundColor: color || theme.palette.primary.main,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
        fontSize: 40,
        color: 'white'
    }
}));

const features = [
    { id: 'system', title: 'QUẢN LÝ HỆ THỐNG', icon: <SettingsIcon />, color: '#757575' },
    { id: 'pigs', title: 'QUẢN LÝ THÔNG TIN ĐÀN', icon: <PetsIcon />, color: '#F06292' },
    { id: 'food', title: 'QUẢN LÝ THỨC ĂN', icon: <RestaurantIcon />, color: '#FFD600' },
    { id: 'health', title: 'QUẢN LÝ BỆNH LÝ', icon: <MedicalServicesIcon />, color: '#E53935' },
    { id: 'export', title: 'QUẢN LÝ XUẤT CHUỒNG', icon: <LocalShippingIcon />, color: '#0D47A1' }
];

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
            setLoading(false);
            const userInfo = authService.getUserInfo();
            if (userInfo) setUser(userInfo);
        }
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenuClick = (menuId) => setActiveMenu(menuId);

    const handleFeatureClick = (featureId) => {
        if (featureId === 'pigs') {
            setActiveMenu('pigpens');
        } else {
            console.log(`Chức năng ${featureId} đang phát triển`);
        }
    };

    if (loading) return <Box sx={{ p: 5 }}>Đang tải...</Box>;

    return (
        <Box sx={{ display: 'flex' }}>
            <TopMenu handleDrawerToggle={handleDrawerToggle} user={user} />
            
            <Sidebar 
                mobileOpen={mobileOpen} 
                handleDrawerToggle={handleDrawerToggle} 
                activeMenu={activeMenu} 
                handleMenuClick={handleMenuClick} 
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <Toolbar />

                {activeMenu === 'dashboard' && (
                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        <Grid container spacing={4} justifyContent="center">
                            {features.map((feature) => (
                                <Grid item xs={12} sm={6} md={4} key={feature.id}>
                                    <Paper elevation={3} sx={{
                                        p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' }
                                    }}
                                           onClick={() => handleFeatureClick(feature.id)}>
                                        <FeatureIcon color={feature.color}>{feature.icon}</FeatureIcon>
                                        <Typography variant="subtitle1" align="center" sx={{ mt: 2, fontWeight: 'bold' }}>
                                            {feature.title}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                )}

                {activeMenu === 'pigpens' && (
                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        <PenManager />
                    </Container>
                )}

                {activeMenu === 'employees' && (
                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        <EmployeeManager />
                    </Container>
                )}
            </Box>
        </Box>
    );
}

export default DashboardPage;