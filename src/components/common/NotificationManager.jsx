import React, { useEffect, useState } from "react";
import { notificationService } from "../../services/NotificationService";
import "../styles/NotificationManager.css";
import {
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack,
    Box,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Typography,
    Snackbar,
    Alert,
    InputAdornment,
    TablePagination,
    Tooltip,
    Chip,
    CircularProgress
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    Refresh,
    Notifications as NotificationsIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
// Sử dụng các component có sẵn
import CreateNotificationForm from "../common/CreateNotificationManager";
import UpdateNotificationForm from "../common/UpdateNotificationForm";
import { useNavigate } from "react-router-dom";

// Styled components
const ActionButton = styled(Button)(({ theme }) => ({
    minWidth: '32px',
    padding: '6px 12px',
    boxShadow: 'none',
    '&:hover': {
        boxShadow: theme.shadows[2]
    }
}));

const StyledTableCell = styled(TableCell)(() => ({
    padding: '12px 16px',
    fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[1],
    borderRadius: '8px'
}));

export default function NotificationManager() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        notificationId: null
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Kiểm tra quyền - chỉ MANAGER mới được truy cập trang này
        const role = localStorage.getItem('role');
        setUserRole(role);
        if (role !== 'MANAGER') {
            navigate('/dashboard');
            return;
        }

        fetchNotifications();
    }, [navigate]);

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
            setFilteredNotifications(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách thông báo:", err);
            showNotification("Không thể tải danh sách thông báo", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            if (searchTerm) {
                const data = await notificationService.search(searchTerm);
                setFilteredNotifications(data);
                if (data.length === 0) {
                    showNotification("Không tìm thấy kết quả phù hợp", "info");
                }
            } else {
                await fetchNotifications();
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thông báo:", error);
            showNotification("Có lỗi xảy ra khi tìm kiếm", "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        fetchNotifications();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const today = new Date();

        // Same day, show time only
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Within a week, show day of week and time
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (date > oneWeekAgo) {
            return date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Otherwise full date
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({ open: true, notificationId: id });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, notificationId: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await notificationService.delete(deleteDialog.notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== deleteDialog.notificationId));
            setFilteredNotifications((prev) => prev.filter((n) => n.id !== deleteDialog.notificationId));
            showNotification("Xóa thông báo thành công");
        } catch (err) {
            console.error("Lỗi khi xóa thông báo:", err);
            showNotification("Lỗi khi xóa thông báo", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    const paginatedNotifications = filteredNotifications.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Nếu không phải MANAGER, không hiển thị trang này
    if (userRole !== 'MANAGER') {
        return null;
    }

    return (
        <Box sx={{ py: 2 }}>
            {/* Title */}
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý thông báo</h1>
            </Stack>

            {/* Search container */}
            <SearchContainer elevation={1} className="search-container">
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm theo nội dung..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 1 }
                        }}
                        size="small"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                        onClick={handleSearch}
                        disabled={searchLoading}
                        sx={{
                            flexShrink: 0,
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    {searchTerm && (
                        <Button
                            variant="text"
                            color="error"
                            onClick={handleResetFilters}
                            size="small"
                            startIcon={<Refresh />}
                            sx={{ flexShrink: 0 }}
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </Stack>
            </SearchContainer>

            {/* Counter and Add button */}
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tổng số thông báo: {filteredNotifications.length}
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => setOpenCreateForm(true)}
                        sx={{
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            backgroundColor: '#1E8449',
                            '&:hover': {
                                backgroundColor: '#155d32'
                            }
                        }}
                    >
                        Thêm thông báo
                    </Button>
                </div>
            </Typography>

            {/* Table with loading state */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 2,
                    position: 'relative'
                }}
                className="table-container"
            >
                {loading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 1
                    }}>
                        <CircularProgress />
                    </Box>
                )}
                <Table sx={{ minWidth: 650 }} aria-label="notifications table" className="notification-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Nội dung</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Thời gian đăng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Trạng thái</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Hành động</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedNotifications.length > 0 ? (
                            paginatedNotifications.map((notif, index) => (
                                <TableRow
                                    key={notif.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                        '&:hover': { backgroundColor: '#f0f7ff' },
                                    }}
                                >
                                    <StyledTableCell>{notif.id}</StyledTableCell>
                                    <StyledTableCell sx={{ maxWidth: '400px' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {notif.content}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(notif.postedAt)}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            label={notif.read ? "Đã đọc" : "Chưa đọc"}
                                            color={notif.read ? "default" : "primary"}
                                            size="small"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Sửa">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="warning"
                                                    onClick={() => {
                                                        setSelectedNotification(notif);
                                                        setOpenUpdateForm(true);
                                                    }}
                                                    className="action-button"
                                                >
                                                    <Edit fontSize="small" />
                                                    <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                                                        SỬA
                                                    </Box>
                                                </ActionButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(notif.id)}
                                                    className="action-button"
                                                >
                                                    <Delete fontSize="small" />
                                                    <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                                                        XÓA
                                                    </Box>
                                                </ActionButton>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu thông báo
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredNotifications.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Dialog form to add notification */}
            <CreateNotificationForm
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                onCreated={() => {
                    fetchNotifications();
                    showNotification("Thêm thông báo thành công");
                }}
            />

            {/* Dialog form to update notification */}
            <UpdateNotificationForm
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                notification={selectedNotification}
                onUpdated={() => {
                    fetchNotifications();
                    showNotification("Cập nhật thông báo thành công");
                }}
            />

            {/* Dialog to confirm delete */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ sx: { borderRadius: '8px' } }}
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{ borderBottom: '1px solid #e0e0e0' }}
                >
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa thông báo này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleDeleteCancel} color="primary" variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}