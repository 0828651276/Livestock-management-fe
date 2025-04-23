// src/components/common/NotificationDropdown.jsx
import React, { useState, useEffect } from 'react';
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
    const [userRole, setUserRole] = useState('');
    const open = Boolean(anchorEl);

    // Lấy vai trò người dùng khi component được mount
    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);
    }, []);

    // Kiểm tra xem người dùng có quyền admin không
    const isAdmin = userRole === 'MANAGER';

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
        // Chỉ cho phép admin mở menu quản lý thông báo (sửa/xóa)
        if (isAdmin) {
            setAnchorElMenu(event.currentTarget);
            setMenuNotifId(notifId);
        }
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

    // Hàm lấy trạng thái đã đọc, tương thích mọi trường hợp
    const getIsRead = n => {
        if (typeof n.isRead === 'boolean') return n.isRead;
        if (typeof n.read === 'boolean') return n.read;
        if (typeof n.is_read === 'boolean') return n.is_read;
        if (typeof n.isRead === 'string') return n.isRead === 'true';
        if (typeof n.read === 'string') return n.read === 'true';
        if (typeof n.is_read === 'string') return n.is_read === 'true';
        return false;
    };

    // Đếm số lượng thông báo chưa đọc
    const unreadCount = notifications.filter(n => !getIsRead(n)).length;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} sx={{ mr: 2 }}>
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
                PaperProps={{ sx: { minWidth: 320 } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Thông báo</Typography>
                    {/* Chỉ hiển thị nút thêm mới nếu là admin */}
                    {isAdmin && (
                        <IconButton size="small" color="primary" onClick={handleOpenCreate}>
                            <AddIcon />
                        </IconButton>
                    )}
                </Box>
                <Divider />

                {/* Form thêm thông báo - chỉ hiển thị cho admin */}
                {isAdmin && (
                    <CreateNotificationForm open={openCreate} onClose={handleCloseCreate} onCreated={onCreated || handleCreated} />
                )}

                {notifications.length === 0 ? (
                    <MenuItem disabled>Không có thông báo nào</MenuItem>
                ) : (
                    notifications.map(notif => (
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
                            onClick={async () => {
                                if (!getIsRead(notif)) {
                                    await notificationService.markAsRead(notif.id);
                                    onCreated && onCreated();
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{notif.content}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {notif.postedAt ? dayjs(notif.postedAt).fromNow() : ''}
                                    </Typography>
                                </Box>
                                {/* Chỉ hiển thị nút 3 chấm (quản lý) nếu là admin */}
                                {isAdmin && (
                                    <IconButton size="small" sx={{ ml: 1 }} onClick={e => { e.stopPropagation(); handleMenuOpen(e, notif.id); }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Menu quản lý thông báo - chỉ hiển thị cho admin */}
            {isAdmin && (
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
            )}

            {/* Form cập nhật thông báo - chỉ hiển thị cho admin */}
            {isAdmin && (
                <UpdateNotificationForm
                    open={openUpdate}
                    onClose={handleCloseUpdate}
                    notification={selectedNotification}
                    onUpdated={onCreated}
                />
            )}
        </>
    );
};

export default NotificationDropdown;