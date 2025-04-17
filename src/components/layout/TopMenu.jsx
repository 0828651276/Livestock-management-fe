// components/layout/TopMenu.jsx
import React, { useState } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box,
    Menu, MenuItem, Divider, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const TopMenu = ({ drawerWidth, handleDrawerToggle, user }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const open = Boolean(anchorEl);

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
        // Xóa thông tin đăng nhập khỏi localStorage hoặc cookie (nếu có)
        localStorage.removeItem('user');  // Hoặc tùy chỉnh theo cách lưu trữ của bạn

        // Chuyển hướng về trang đăng nhập sau khi đăng xuất
        navigate('/logout');
    };

    return (
        <AppBar position="fixed" sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: 'white',
            color: '#333'
        }}>
            <Toolbar>
                <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' }, mr: 2 }}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Livestock - Pig Farm Management System
                </Typography>
                <Box onClick={handleUserMenuOpen} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <IconButton><PersonIcon /></IconButton>
                    <Typography sx={{ ml: 1 }}>{user?.username || 'User'}</Typography>
                </Box>
                <Menu anchorEl={anchorEl} open={open} onClose={handleUserMenuClose}>
                    <MenuItem onClick={() => navigate('/dashboard/employees/detail')}>
                        Thông tin tài khoản
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/dashboard/change-password')}>
                        Đổi mật khẩu
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogoutConfirmOpen}>
                        <LogoutIcon fontSize="small" />
                        <Typography sx={{ ml: 1 }}>Đăng xuất</Typography>
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
