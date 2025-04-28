// components/layout/TopMenu.jsx
import React, {useEffect, useState} from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box,
    Menu, MenuItem, Divider, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import {authService} from '../../services/authService';
import Avatar from '@mui/material/Avatar';
import {useNavigate} from 'react-router-dom';
import {employeeService} from "../../services/EmployeeService.js";
import { notificationService } from '../../services/NotificationService';
import NotificationDropdown from "../common/NotificationDropdown.jsx";

const TopMenu = ({drawerWidth, handleDrawerToggle, user}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const open = Boolean(anchorEl);
    const [profile, setProfile] = useState();
    const [lastUpdate, setLastUpdate] = useState(Date.now);
    const [userRole, setUserRole] = useState('');

    const [notifications, setNotifications] = useState([]);
    const fetchEmployee = async () => {
        try {
            const employeeId = localStorage.getItem('employeeId') || undefined;
            if (employeeId) {
                const res = await employeeService.getById(employeeId);
                setProfile(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin nhân viên:", error);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);

        fetchEmployee();
    }, [lastUpdate]);

    useEffect(() => {
        const handleProfileUpdate = () => {
            setLastUpdate(Date.now());
        };

        window.addEventListener('profile-updated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, []);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await notificationService.getAll();
                setNotifications(data);
            } catch (err) {
                setNotifications([]);
            }
        }
        // Chỉ fetch thông báo nếu là employee
        if (userRole === 'STAFF') {
            fetchNotifications();
        }
    }, [userRole]);

    const reloadNotifications = async () => {
        try {
            // Chỉ fetch khi là employee
            if (userRole === 'STAFF') {
                const data = await notificationService.getAll();
                setNotifications(data);
            }
        } catch (err) {
            setNotifications([]);
        }
    };

    useEffect(() => {
        window.reloadNotifications = reloadNotifications;
        // Chỉ gọi nếu là employee
        if (userRole === 'STAFF') {
            reloadNotifications();
        }
        return () => { delete window.reloadNotifications; };
    }, [userRole]);

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
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AppBar position="fixed" sx={{
            width: {sm: `calc(100% - ${drawerWidth}px)`},
            ml: {sm: `${drawerWidth}px`},
            backgroundColor: 'white',
            color: '#333'
        }}>
            <Toolbar>
                <IconButton onClick={handleDrawerToggle} sx={{display: {sm: 'none'}, mr: 2}}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    Livestock - Pig Farm Management System
                </Typography>
                {/* Chỉ hiển thị nút thông báo nếu là STAFF, không phải MANAGER */}
                {userRole === 'STAFF' && (
                    <NotificationDropdown notifications={notifications} onCreated={reloadNotifications} hasUnread={notifications.some(n => !(n.isRead || n.read || n.is_read === true || n.isRead === 'true' || n.read === 'true' || n.is_read === 'true'))} />
                )}
                <Box onClick={handleUserMenuOpen} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <IconButton>
                        <Avatar
                            src={profile && profile.imagePath
                                ? `http://localhost:8080/${profile.imagePath}?t=${lastUpdate}`
                                : ''}
                            alt="Avatar"
                            sx={{ width: 30, height: 30 }}
                        />
                    </IconButton>
                    <Typography sx={{ ml: 1 }}>{user?.username || 'User'}</Typography>
                </Box>
                <Menu anchorEl={anchorEl} open={open} onClose={handleUserMenuClose}>
                    <MenuItem onClick={() => navigate('/dashboard/employees/detail')}>
                        Thông tin tài khoản
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/dashboard/change-password')}>
                        Đổi mật khẩu
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick={handleLogoutConfirmOpen}>
                        <LogoutIcon fontSize="small"/>
                        <Typography sx={{ml: 1}}>Đăng xuất</Typography>
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
    );
};

export default TopMenu;