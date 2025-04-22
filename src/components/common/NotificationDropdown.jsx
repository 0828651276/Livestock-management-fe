import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Divider, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateNotificationForm from "./CreateNotificationManager.jsx";
import UpdateNotificationForm from "./UpdateNotificationForm.jsx";
import { notificationService } from '../../services/NotificationService';
dayjs.extend(relativeTime);

// Nhận props notifications là mảng các thông báo dạng { id, content, posted_date }
const NotificationDropdown = ({ notifications = [], onCreated }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [anchorElMenu, setAnchorElMenu] = useState(null);
    const [menuNotifId, setMenuNotifId] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const open = Boolean(anchorEl);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleOpenCreate = () => setOpenCreate(true);
    const handleCloseCreate = () => setOpenCreate(false);
    // Hàm reload lại danh sách khi thêm mới thành công
    const handleCreated = () => {
        if (typeof window.reloadNotifications === 'function') {
            window.reloadNotifications();
        }
    };

    const handleMenuOpen = (event, notifId) => {
        setAnchorElMenu(event.currentTarget);
        setMenuNotifId(notifId);
    };
    const handleMenuClose = () => {
        setAnchorElMenu(null);
        setMenuNotifId(null);
    };

    const handleUpdateClick = () => {
        const notif = notifications.find(n => n.id === menuNotifId);
        setSelectedNotification(notif);
        setOpenUpdate(true);
        handleMenuClose();
    };
    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setSelectedNotification(null);
    };
    const handleDeleteClick = async () => {
        setDeleting(true);
        try {
            await notificationService.delete(menuNotifId);
            if (onCreated) onCreated();
        } catch (err) {
            alert('Xóa thông báo thất bại');
        } finally {
            setDeleting(false);
            handleMenuClose();
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} sx={{ mr: 2 }}>
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 320 } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Thông báo</Typography>
                    <IconButton size="small" color="primary" onClick={handleOpenCreate}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <Divider />
                <CreateNotificationForm open={openCreate} onClose={handleCloseCreate} onCreated={onCreated || handleCreated} />
                {notifications.length === 0 ? (
                    <MenuItem disabled>Không có thông báo nào</MenuItem>
                ) : (
                    notifications.map(notif => (
                        <MenuItem key={notif.id} sx={{ display: 'block', whiteSpace: 'normal', position: 'relative', py: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{notif.content}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {notif.postedAt ? dayjs(notif.postedAt).fromNow() : ''}
                                    </Typography>
                                </Box>
                                <IconButton size="small" sx={{ ml: 1 }} onClick={e => handleMenuOpen(e, notif.id)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
            {/* Menu cho 3 chấm */}
            <Menu
                anchorEl={anchorElMenu}
                open={Boolean(anchorElMenu)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleUpdateClick}>Cập nhật</MenuItem>
                <MenuItem onClick={handleDeleteClick} disabled={deleting}>{deleting ? 'Đang xóa...' : 'Xóa'}</MenuItem>
            </Menu>
            <UpdateNotificationForm
                open={openUpdate}
                onClose={handleCloseUpdate}
                notification={selectedNotification}
                onUpdated={onCreated}
            />
        </>
    );
};

export default NotificationDropdown;
