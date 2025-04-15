import React, { useEffect, useState } from 'react';
import {
    AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText,
    IconButton, Typography, Box, Container, Grid, Paper, Avatar,
    Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PetsIcon from '@mui/icons-material/Pets';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HouseIcon from '@mui/icons-material/House';
import PeopleIcon from '@mui/icons-material/People';
import { styled } from '@mui/material/styles';
import { authService } from '../services/authService';
import EmployeeManager from "../components/employee/EmployeeManager.jsx";
import PenManager from "../components/pen/PenManager.jsx";

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
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [user, setUser] = useState({ username: '' });
    const open = Boolean(anchorEl);

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

    const handleUserMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleUserMenuClose = () => setAnchorEl(null);

    const handleLogoutConfirmOpen = () => {
        handleUserMenuClose();
        setLogoutConfirmOpen(true);
    };

    const handleLogoutConfirmClose = () => setLogoutConfirmOpen(false);

    const handleLogoutConfirm = () => {
        setLogoutConfirmOpen(false);
        authService.logout();
        window.location.href = '/';
    };

    const handleMenuClick = (menuId) => setActiveMenu(menuId);

    const handleFeatureClick = (featureId) => {
        if (featureId === 'pigs') {
            setActiveMenu('pigpens');
        } else {
            console.log(`Chức năng ${featureId} đang phát triển`);
        }
    };

    const drawer = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ backgroundColor: '#1E8449', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>LIVESTOCK</Typography>
            </Toolbar>
            <List>
                <ListItem onClick={() => handleMenuClick('dashboard')}
                          sx={{ backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'dashboard' ? '#FF5722' : 'white' }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem onClick={() => handleMenuClick('employees')}
                          sx={{ backgroundColor: activeMenu === 'employees' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'employees' ? '#FF5722' : 'white' }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Quản lý nhân viên" />
                </ListItem>
                <ListItem onClick={() => handleMenuClick('pigpens')}
                          sx={{ backgroundColor: activeMenu === 'pigpens' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'pigpens' ? '#FF5722' : 'white' }}>
                        <HouseIcon />
                    </ListItemIcon>
                    <ListItemText primary="Danh sách Chuồng" />
                </ListItem>
            </List>
        </div>
    );

    if (loading) return <Box sx={{ p: 5 }}>Đang tải...</Box>;

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backgroundColor: 'white', color: '#333' }}>
                <Toolbar>
                    <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' }, mr: 2 }}><MenuIcon /></IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Livestock - Pig Farm Management System
                    </Typography>
                    <Box onClick={handleUserMenuOpen} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <IconButton><PersonIcon /></IconButton>
                        <Typography sx={{ ml: 1 }}>{user.username || 'User'}</Typography>
                    </Box>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleUserMenuClose}>
                        <MenuItem disabled>Thông tin tài khoản</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogoutConfirmOpen}>
                            <LogoutIcon fontSize="small" /> <ListItemText sx={{ ml: 1 }}>Đăng xuất</ListItemText>
                        </MenuItem>
                    </Menu>
                    <Dialog open={logoutConfirmOpen} onClose={handleLogoutConfirmClose}>
                        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Bạn có chắc chắn muốn đăng xuất?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleLogoutConfirmClose}>Hủy</Button>
                            <Button onClick={handleLogoutConfirm} color="error">Đăng xuất</Button>
                        </DialogActions>
                    </Dialog>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': {
                                width: drawerWidth, backgroundColor: '#222', color: 'white'
                            }
                        }}>
                    {drawer}
                </Drawer>
                <Drawer variant="permanent" open
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                width: drawerWidth, backgroundColor: '#222', color: 'white'
                            }
                        }}>
                    {drawer}
                </Drawer>
            </Box>

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
