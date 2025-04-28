import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Avatar,
    Card,
    CardContent,
    Stack,
    Chip,
    Divider,
    ButtonBase,
    useTheme,
    useMediaQuery,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Dashboard as DashboardIcon,
    Pets as PetsIcon,
    Restaurant as RestaurantIcon,
    MedicalServices as MedicalServicesIcon,
    LocalShipping as LocalShippingIcon,
    Analytics as AnalyticsIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    CalendarMonth as CalendarMonthIcon,
    BarChart as BarChartIcon,
    Refresh as RefreshIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { pigPenService } from '../services/pigPenService';
import { format } from 'date-fns';
import TopMenu from "../components/layout/TopMenu.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { Outlet } from 'react-router-dom';

// Dashboard Styled Components
const StyledCard = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
    },
}));

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
    width: 70,
    height: 70,
    backgroundColor: color || theme.palette.primary.main,
    margin: '0 auto 16px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
        fontSize: 38,
        color: 'white'
    },
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)'
    }
}));

const StatCard = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(2),
    borderRadius: 16,
    backgroundColor: color || '#ffffff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    height: '100%',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        transform: 'translateY(-3px)'
    },
}));

const WelcomeBanner = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
    borderRadius: 16,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'medium',
    fontSize: '0.875rem',
    padding: '12px 16px',
    '&.tableHeader': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        fontWeight: 'bold',
    }
}));

// Decorative circles for the banner
const DecorativeCircle = styled(Box)(({ size, top, right, opacity }) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: top,
    right: right,
    opacity: opacity
}));

function DashboardPage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [user, setUser] = useState({ username: '' });
    const drawerWidth = 240;

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
    const handleMenuClick = (menuId) => setActiveMenu(menuId);

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
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                {/* Chỉ render nội dung page con qua Outlet, không render dashboard ở đây */}
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardPage;