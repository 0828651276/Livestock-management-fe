import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Paper,
    Grid,
    Container,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Chiều rộng của thanh sidebar
const drawerWidth = 240;

// Styled component cho các icon menu chính
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

// Danh sách các menu chính
const features = [
    {
        id: 'system',
        title: 'QUẢN LÝ HỆ THỐNG',
        icon: <SettingsIcon fontSize="large" />,
        color: '#757575'
    },
    {
        id: 'pigs',
        title: 'QUẢN LÝ THÔNG TIN ĐÀN',
        icon: <PetsIcon fontSize="large" />,
        color: '#F06292'
    },
    {
        id: 'food',
        title: 'QUẢN LÝ THỨC ĂN',
        icon: <RestaurantIcon fontSize="large" />,
        color: '#FFD600'
    },
    {
        id: 'health',
        title: 'QUẢN LÝ BỆNH LÝ',
        icon: <MedicalServicesIcon fontSize="large" />,
        color: '#E53935'
    },
    {
        id: 'export',
        title: 'QUẢN LÝ XUẤT CHUỒNG',
        icon: <LocalShippingIcon fontSize="large" />,
        color: '#0D47A1'
    }
];

function DashboardPage() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeMenu, setActiveMenu] = useState('dashboard'); // Để theo dõi menu đang active
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false); // State cho dialog xác nhận đăng xuất
    const [user, setUser] = useState({ username: '' }); // State lưu thông tin người dùng
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Kiểm tra xác thực
        const token = authService.getCurrentUser();
        if (!token) {
            window.location.href = '/'; // Chuyển hướng về trang đăng nhập nếu chưa xác thực
        } else {
            setLoading(false);
            // Lấy thông tin người dùng từ authService
            const userInfo = authService.getUserInfo();
            if (userInfo) {
                setUser(userInfo);
            }
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    // Mở dialog xác nhận đăng xuất
    const handleLogoutConfirmOpen = () => {
        handleUserMenuClose(); // Đóng menu dropdown
        setLogoutConfirmOpen(true);
    };

    // Đóng dialog xác nhận đăng xuất
    const handleLogoutConfirmClose = () => {
        setLogoutConfirmOpen(false);
    };

    // Xử lý đăng xuất khi đã xác nhận
    const handleLogoutConfirm = () => {
        setLogoutConfirmOpen(false);
        authService.logout();
        window.location.href = '/';
    };

    const handleProfile = () => {
        handleUserMenuClose();
        setActiveMenu('profile');
        console.log('Mở trang Profile');
        // Xử lý mở profile
    };

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        console.log(`Menu ${menuId} được chọn`);
        // Xử lý chuyển trang
        if (menuId === 'pigpens') {
            navigate('/pigpens');
        }
    };

    const handleFeatureClick = (featureId) => {
        console.log(`Chức năng ${featureId} được chọn`);
        // Xử lý chuyển trang hoặc hiển thị panel tương ứng
        if (featureId === 'pigs') {
            navigate('/pigpens');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>Đang tải...</Box>;
    }

    const drawer = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ backgroundColor: '#1E8449', color: 'white' }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    LIVESTOCK
                </Typography>
            </Toolbar>

            {/* Menu chính - Đã bỏ nút Profile */}
            <List>
                <ListItem
                    component="div"
                    onClick={() => handleMenuClick('dashboard')}
                    sx={{
                        backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent',
                        my: 0.5,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: activeMenu === 'dashboard' ? '#444' : 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: activeMenu === 'dashboard' ? '#FF5722' : 'white' }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>

                {/* Nút Danh sách Chuồng */}
                <ListItem
                    component="div"
                    onClick={() => handleMenuClick('pigpens')}
                    sx={{
                        backgroundColor: activeMenu === 'pigpens' ? '#333' : 'transparent',
                        my: 0.5,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: activeMenu === 'pigpens' ? '#444' : 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: activeMenu === 'pigpens' ? '#FF5722' : 'white' }}>
                        <HouseIcon />
                    </ListItemIcon>
                    <ListItemText primary="Danh sách Chuồng" />
                </ListItem>
            </List>

            <Box sx={{ flexGrow: 1 }} />
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar - thanh ngang trên cùng */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: '#333'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Livestock - Pig Farm Management System
                    </Typography>

                    {/* Admin Menu - Đã cập nhật để hiển thị tên đăng nhập thật */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={handleUserMenuOpen}
                    >
                        <IconButton color="inherit">
                            <PersonIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {user.username || 'User'}
                        </Typography>
                    </Box>

                    {/* Menu popup khi click vào Admin */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfile} sx={{ cursor: 'pointer' }}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Profile</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogoutConfirmOpen} sx={{ cursor: 'pointer' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Đăng xuất</ListItemText>
                        </MenuItem>
                    </Menu>

                    {/* Dialog xác nhận đăng xuất */}
                    <Dialog
                        open={logoutConfirmOpen}
                        onClose={handleLogoutConfirmClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Xác nhận đăng xuất"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleLogoutConfirmClose} color="primary">
                                Hủy
                            </Button>
                            <Button onClick={handleLogoutConfirm} color="error" autoFocus>
                                Đăng xuất
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Toolbar>
            </AppBar>

            {/* Sidebar - thanh dọc bên trái */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* CSS toàn cục cho tất cả các ListItem trong drawer */}
                <style>
                    {`
            .MuiListItem-root {
              cursor: pointer !important;
            }
          `}
                </style>

                {/* Responsive drawer - hiển thị trên mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: '#222',
                            color: 'white'
                        },
                        '& .MuiListItemIcon-root': {
                            color: 'white'
                        }
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Permanent drawer - hiển thị trên desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: '#222',
                            color: 'white'
                        },
                        '& .MuiListItemIcon-root': {
                            color: 'white'
                        }
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Khu vực chính */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh'
                }}
            >
                <Toolbar /> {/* Tạo khoảng trống phía trên để tránh nội dung bị AppBar che mất */}

                {/* Hiển thị nội dung dựa trên menu đang active */}
                {activeMenu === 'dashboard' && (
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Grid container spacing={4} justifyContent="center">
                            {features.map((feature) => (
                                <Grid xs={12} sm={6} md={4} key={feature.id}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.03)'
                                            }
                                        }}
                                        onClick={() => handleFeatureClick(feature.id)}
                                    >
                                        <FeatureIcon color={feature.color}>
                                            {feature.icon}
                                        </FeatureIcon>
                                        <Typography
                                            variant="subtitle1"
                                            align="center"
                                            sx={{
                                                mt: 2,
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                )}

                {/* Nội dung trang Profile */}
                {activeMenu === 'profile' && (
                    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                        <Paper elevation={3} sx={{ p: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                Thông tin cá nhân
                            </Typography>
                            <Typography variant="body1">
                                Đây là trang thông tin cá nhân của bạn. Bạn có thể cập nhật thông tin hoặc thay đổi mật khẩu tại đây.
                            </Typography>
                        </Paper>
                    </Container>
                )}
            </Box>
        </Box>
    );
}

export default DashboardPage;