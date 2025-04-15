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
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
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
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { authService } from '../services/authService';
import { pigPenService } from '../services/pigPenService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

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

// Header cột của bảng
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    padding: '16px'
}));

// Styled component cho Paper
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
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
    const [pigPens, setPigPens] = useState([]);
    const [pigPensLoading, setPigPensLoading] = useState(true);
    const [showPigPenList, setShowPigPenList] = useState(false); // State để hiển thị/ẩn danh sách chuồng
    const [currentPigPen, setCurrentPigPen] = useState(null); // State cho pigpen đang được chọn để xóa
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // State cho dialog xác nhận xóa
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
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

            // Fetch danh sách chuồng
            fetchPigPens();
        }
    }, []);

    // Fetch danh sách chuồng
    const fetchPigPens = async () => {
        try {
            setPigPensLoading(true);
            const data = await pigPenService.getAllPigPens();
            setPigPens(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu chuồng:', error);
        } finally {
            setPigPensLoading(false);
        }
    };

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
        navigate('/')
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
        } else if (menuId === 'employees') {
            navigate('/employees'); // Điều hướng đến trang quản lý nhân viên
        }
    };

    const handleFeatureClick = (featureId) => {
        console.log(`Chức năng ${featureId} được chọn`);

        // Hiển thị danh sách chuồng khi nhấp vào "QUẢN LÝ THÔNG TIN ĐÀN"
        if (featureId === 'pigs') {
            setShowPigPenList(true); // Hiển thị danh sách chuồng
        } else {
            // Xử lý các chức năng khác (có thể điều hướng đến trang khác)
            console.log(`Chức năng ${featureId} đang được phát triển`);
        }
    };

    const handleAddPigPen = () => {
        navigate('/pigpens'); // Điều hướng đến trang pigpen để thêm mới
    };

    const handleEditPigPen = (penId) => {
        navigate(`/pigpens?editId=${penId}`); // Điều hướng với query param để mở form edit
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Hiển thị trạng thái chuồng
    const getPenStatus = (closedDate) => {
        return closedDate
            ? <Chip label="Đã đóng" color="error" size="small" />
            : <Chip label="Đang hoạt động" color="success" size="small" />;
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

            {/* Menu chính */}
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

                {/* Nút Quản lý nhân viên */}
                <ListItem
                    component="div"
                    onClick={() => handleMenuClick('employees')}
                    sx={{
                        backgroundColor: activeMenu === 'employees' ? '#333' : 'transparent',
                        my: 0.5,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: activeMenu === 'employees' ? '#444' : 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: activeMenu === 'employees' ? '#FF5722' : 'white' }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Quản lý nhân viên" />
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
                        {/* Phần các chức năng - chỉ hiển thị khi danh sách chuồng không được hiển thị */}
                        {!showPigPenList && (
                            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                                {features.map((feature) => (
                                    <Grid item xs={12} sm={6} md={4} key={feature.id}>
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
                        )}

                        {/* Danh sách chuồng lợn - hiển thị khi showPigPenList = true hoặc mặc định trên dashboard */}
                        {showPigPenList && (
                            <StyledPaper>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton
                                            onClick={handleBackToMainMenu}
                                            sx={{ mr: 1 }}
                                            aria-label="Quay lại"
                                        >
                                            <ArrowBackIcon />
                                        </IconButton>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Danh sách chuồng lợn
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Tổng số: {pigPens.length} chuồng
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddPigPen}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#1E8449',
                                                '&:hover': {
                                                    backgroundColor: '#14532d'
                                                }
                                            }}
                                        >
                                            Thêm chuồng
                                        </Button>
                                    </Box>
                                </Box>

                                {pigPensLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell>ID</StyledTableCell>
                                                    <StyledTableCell>Tên chuồng</StyledTableCell>
                                                    <StyledTableCell>Ngày tạo</StyledTableCell>
                                                    <StyledTableCell>Ngày đóng</StyledTableCell>
                                                    <StyledTableCell>Số lượng</StyledTableCell>
                                                    <StyledTableCell>Trạng thái</StyledTableCell>
                                                    <StyledTableCell align="center">Thao tác</StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pigPens.length > 0 ? (
                                                    pigPens.map((pigPen) => (
                                                        <TableRow key={pigPen.penId} hover>
                                                            <TableCell>{pigPen.penId}</TableCell>
                                                            <TableCell>{pigPen.name}</TableCell>
                                                            <TableCell>{formatDate(pigPen.createdDate)}</TableCell>
                                                            <TableCell>{formatDate(pigPen.closedDate)}</TableCell>
                                                            <TableCell>{pigPen.quantity}</TableCell>
                                                            <TableCell>{getPenStatus(pigPen.closedDate)}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => handleEditPigPen(pigPen.penId)}
                                                                    size="small"
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => handleDeletePigPen(pigPen)}
                                                                    size="small"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center">
                                                            Không có dữ liệu chuồng
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </StyledPaper>
                        )}
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