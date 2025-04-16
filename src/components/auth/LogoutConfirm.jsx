import React, { useState } from 'react';
import {
    Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, ListItemText
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

function LogoutConfirm({ anchorEl, open, onClose }) {
    const navigate = useNavigate();
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const handleLogoutConfirmOpen = () => {
        onClose();
        setLogoutConfirmOpen(true);
    };

    const handleLogoutConfirmClose = () => setLogoutConfirmOpen(false);

    const handleLogoutConfirm = () => {
        setLogoutConfirmOpen(false);
        authService.logout();
        navigate('/');
    };

    return (
        <>
            <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
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
        </>
    );
}

export default LogoutConfirm;