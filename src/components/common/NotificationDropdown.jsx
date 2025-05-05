// src/components/common/NotificationDropdown.jsx
import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Divider, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationService } from '../../services/NotificationService';
import '../../styles/bell-shake.css';

dayjs.extend(relativeTime);

const NotificationDropdown = ({ notifications = [], onCreated, hasUnread }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [employeeNotifications, setEmployeeNotifications] = useState([]);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role);
        setEmployeeId(id);
    }, []);

    useEffect(() => {
        if (userRole === 'STAFF' && employeeId && notifications.length > 0) {
            setEmployeeNotifications(notifications);
        }
    }, [userRole, employeeId, notifications]);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleMarkAsRead = async (notifId) => {
        try {
            await notificationService.markAsRead(notifId);
            onCreated && onCreated();
            handleClose();
        } catch (err) {
            console.error("Lỗi khi đánh dấu đã đọc:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead(employeeId);
            onCreated && onCreated();
            handleClose();
        } catch (err) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
        }
    };

    const getIsRead = n => {
        if (typeof n.isRead === 'boolean') return n.isRead;
        if (typeof n.read === 'boolean') return n.read;
        if (typeof n.is_read === 'boolean') return n.is_read;
        if (typeof n.isRead === 'string') return n.isRead === 'true';
        if (typeof n.read === 'string') return n.read === 'true';
        if (typeof n.is_read === 'string') return n.is_read === 'true';
        return false;
    };

    const unreadCount = employeeNotifications.filter(n => !getIsRead(n)).length;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} sx={{ mr: 2 }} className={hasUnread ? 'bell-shake' : ''}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 320, maxHeight: '80vh' } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Thông báo</Typography>
                </Box>
                <Divider />

                <MenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <Typography variant="body2" color={unreadCount === 0 ? 'text.disabled' : 'primary'}>
                        Đánh dấu tất cả là đã đọc
                    </Typography>
                </MenuItem>
                <Divider />

                {employeeNotifications.length === 0 ? (
                    <MenuItem disabled>Không có thông báo nào</MenuItem>
                ) : (
                    employeeNotifications.map(notif => (
                        <MenuItem
                            key={notif.id}
                            sx={{
                                display: 'block',
                                whiteSpace: 'normal',
                                position: 'relative',
                                py: 1.5,
                                backgroundColor: getIsRead(notif) ? '#fff' : 'rgba(25, 118, 210, 0.08)',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: getIsRead(notif) ? '#f5f5f5' : 'rgba(25, 118, 210, 0.15)',
                                },
                            }}
                            onClick={() => {
                                if (!getIsRead(notif)) {
                                    handleMarkAsRead(notif.id);
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{
                                        wordBreak: 'break-word',
                                        fontWeight: getIsRead(notif) ? 'normal' : 'bold'
                                    }}>
                                        {notif.content}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {notif.postedAt ? dayjs(notif.postedAt).fromNow() : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationDropdown;
