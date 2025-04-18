import React, { useEffect, useState } from "react";
import { pigPenService } from "../../services/pigPenService";
import "../styles/PenManager.css";
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
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    InputAdornment,
    Grid,
    TablePagination,
    Tooltip,
    CircularProgress,
    Chip
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterAlt,
    FilterAltOff,
    Refresh,
    ExitToApp
} from "@mui/icons-material";
import PigPenFormUpdate from "./PenFormUpdate.jsx";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import { useNavigate } from "react-router-dom";
import PigPenFormCreate from "./PenFormCreate.jsx";
import CaretakersList from "./CaretakersList.jsx";
import { styled } from '@mui/material/styles';

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

export default function PenManager() {
    const navigate = useNavigate();
    const [pigPens, setPigPens] = useState([]);
    const [filteredPigPens, setFilteredPigPens] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [selectedPigPen, setSelectedPigPen] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        penId: null
    });
    const [leaveDialog, setLeaveDialog] = useState({
        open: false,
        penId: null,
        penName: ''
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');

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

    useEffect(() => {
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role);
        setEmployeeId(id);

        // Gọi hàm fetch dữ liệu
        fetchPigPens(role, id);
    }, []);

    const fetchPigPens = async (role, id) => {
        setLoading(true);
        try {
            let res;
            // Nếu là MANAGER, lấy tất cả chuồng
            if (role === 'MANAGER') {
                res = await pigPenService.getAllPigPens();
            }
            // Nếu là STAFF, chỉ lấy chuồng mà nhân viên đó chăm sóc
            else {
                res = await pigPenService.findByEmployeeId(id);
            }

            // Xử lý dữ liệu người chăm sóc
            const processedPens = res.map(pen => ({
                ...pen,
                caretakers: pen.caretakers || (pen.caretaker ? [pen.caretaker] : [])
            }));

            setPigPens(processedPens);
            setFilteredPigPens(processedPens);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chuồng nuôi:", err);
            showNotification("Không thể tải danh sách chuồng nuôi", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            // Nếu có lọc theo ngày
            if (dateRange.startDate || dateRange.endDate) {
                // Dựa trên vai trò để quyết định tìm tất cả hay chỉ tìm theo caretaker
                let res;
                if (userRole === 'MANAGER') {
                    res = await pigPenService.searchByDateRange(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                } else {
                    // Đối với nhân viên, tìm theo date nhưng vẫn chỉ trong phạm vi chuồng họ chăm sóc
                    res = await pigPenService.searchByDateRangeAndCaretaker(
                        dateRange.startDate,
                        dateRange.endDate,
                        employeeId
                    );
                }

                // Lọc thêm theo tên nếu có
                let filteredResults = res;
                if (searchTerm) {
                    filteredResults = res.filter(pen =>
                        pen.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setFilteredPigPens(filteredResults);
                if (filteredResults.length === 0) {
                    showNotification("Không tìm thấy kết quả phù hợp", "info");
                }
            }
            // Tìm theo tên
            else if (searchTerm) {
                let res;
                if (userRole === 'MANAGER') {
                    res = await pigPenService.searchByName(searchTerm);
                } else {
                    // Tìm theo tên trong phạm vi chuồng nhân viên chăm sóc
                    const allPens = await pigPenService.findByEmployeeId(employeeId);
                    res = allPens.filter(pen =>
                        pen.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setFilteredPigPens(res);
                if (res.length === 0) {
                    showNotification("Không tìm thấy kết quả phù hợp", "info");
                }
            }
            // Không có tiêu chí tìm kiếm
            else {
                fetchPigPens(userRole, employeeId);
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
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

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleDateFilter = () => {
        setShowDateFilter(!showDateFilter);
        if (showDateFilter) {
            setDateRange({ startDate: '', endDate: '' });
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange({ startDate: '', endDate: '' });
        fetchPigPens(userRole, employeeId);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN");
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({ open: true, penId: id });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, penId: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await pigPenService.deletePigPen(deleteDialog.penId);
            setPigPens((prev) => prev.filter((p) => p.penId !== deleteDialog.penId));
            setFilteredPigPens((prev) => prev.filter((p) => p.penId !== deleteDialog.penId));
            showNotification("Xóa chuồng nuôi thành công");
        } catch (err) {
            console.error("Lỗi khi xoá chuồng nuôi:", err);
            showNotification("Lỗi khi xóa chuồng nuôi", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    // Xử lý rời chuồng
    const handleLeavePenClick = (penId, penName) => {
        setLeaveDialog({
            open: true,
            penId,
            penName
        });
    };

    const handleLeavePenCancel = () => {
        setLeaveDialog({
            open: false,
            penId: null,
            penName: ''
        });
    };

    const handleLeavePenConfirm = async () => {
        try {
            await pigPenService.removeCaretakerFromPen(leaveDialog.penId, employeeId);
            showNotification(`Đã rời khỏi chuồng ${leaveDialog.penName} thành công`);

            // Cập nhật lại danh sách
            fetchPigPens(userRole, employeeId);
        } catch (err) {
            console.error("Lỗi khi rời khỏi chuồng nuôi:", err);
            showNotification("Lỗi khi rời khỏi chuồng", "error");
        } finally {
            handleLeavePenCancel();
        }
    };

    const paginatedPigPens = filteredPigPens.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ py: 2 }}>
            {/* Action buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý chuồng nuôi</h1>
            </Stack>

            {/* Search and filter container */}
            <SearchContainer elevation={1} className="search-container">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên chuồng..."
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
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                            onClick={handleSearch}
                            disabled={searchLoading}
                            sx={{ height: '40px' }}
                        >
                            Tìm kiếm
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={showDateFilter ? "Ẩn bộ lọc ngày" : "Lọc theo ngày tạo"}>
                            <Button
                                variant="outlined"
                                startIcon={showDateFilter ? <FilterAltOff /> : <FilterAlt />}
                                onClick={handleToggleDateFilter}
                                size="small"
                                color="primary"
                                className="filter-button"
                            >
                                {showDateFilter ? 'Ẩn bộ lọc' : 'Lọc theo ngày'}
                            </Button>
                        </Tooltip>
                        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                            <Button
                                variant="text"
                                color="error"
                                onClick={handleResetFilters}
                                size="small"
                                startIcon={<Refresh />}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Grid>

                    {showDateFilter && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="startDate"
                                    label="Từ ngày"
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="endDate"
                                    label="Đến ngày"
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </SearchContainer>

            {/* Counter */}
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tổng số chuồng: {filteredPigPens.length}
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
                        Thêm chuồng nuôi
                    </Button>
                </div>
            </Typography>

            {/* Table with loading state */}
            <TableContainer component={Paper}
                            sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: 2, position: 'relative' }}
                            className="table-container">
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
                <Table sx={{ minWidth: 650 }} aria-label="pigpen table" className="pen-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Tên chuồng</StyledTableHeaderCell>
                            {userRole === 'MANAGER' && (
                                <StyledTableHeaderCell>Người chăm sóc</StyledTableHeaderCell>
                            )}
                            <StyledTableHeaderCell>Ngày tạo</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày đóng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Trạng thái</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Hành động</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPigPens.length > 0 ? (
                            paginatedPigPens.map((pen, index) => (
                                <TableRow
                                    key={pen.penId}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                        '&:hover': { backgroundColor: '#f0f7ff' }
                                    }}
                                >
                                    <StyledTableCell sx={{ fontWeight: 'medium' }}>{pen.name}</StyledTableCell>
                                    {userRole === 'MANAGER' && (
                                        <StyledTableCell>
                                            <CaretakersList
                                                caretakers={pen.caretakers}
                                            />
                                        </StyledTableCell>
                                    )}
                                    <StyledTableCell>{formatDate(pen.createdDate)}</StyledTableCell>
                                    <StyledTableCell>{formatDate(pen.closedDate) || "Đang hoạt động"}</StyledTableCell>
                                    <StyledTableCell>{pen.quantity}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            label={pen.status === "ACTIVE" ? "Đang hoạt động" : "Đã đóng"}
                                            color={pen.status === "ACTIVE" ? "success" : "error"}
                                            size="small"
                                        />
                                    </StyledTableCell>
                                    {userRole === 'MANAGER' ? (
                                        <StyledTableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Sửa">
                                                    <ActionButton
                                                        size="small"
                                                        variant="contained"
                                                        color="warning"
                                                        onClick={() => {
                                                            setSelectedPigPen(pen);
                                                            setOpenUpdateForm(true);
                                                        }}
                                                        className="action-button"
                                                    >
                                                        <Edit fontSize="small" />
                                                        <Box component="span"
                                                             sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>SỬA</Box>
                                                    </ActionButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <ActionButton
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(pen.penId)}
                                                        className="action-button"
                                                    >
                                                        <Delete fontSize="small" />
                                                        <Box component="span"
                                                             sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>XÓA</Box>
                                                    </ActionButton>
                                                </Tooltip>
                                            </Stack>
                                        </StyledTableCell>
                                    ) : (
                                        <StyledTableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                {pen.caretakers?.some(caretaker => caretaker.employeeId === employeeId) && (
                                                    <>
                                                        <Tooltip title="Sửa">
                                                            <ActionButton
                                                                size="small"
                                                                variant="contained"
                                                                color="warning"
                                                                onClick={() => {
                                                                    setSelectedPigPen(pen);
                                                                    setOpenUpdateForm(true);
                                                                }}
                                                                className="action-button"
                                                            >
                                                                <Edit fontSize="small" />
                                                                <Box component="span"
                                                                     sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>SỬA</Box>
                                                            </ActionButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rời chuồng">
                                                            <ActionButton
                                                                size="small"
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => handleLeavePenClick(pen.penId, pen.name)}
                                                                className="action-button"
                                                            >
                                                                <ExitToApp fontSize="small" />
                                                                <Box component="span"
                                                                     sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>RỜI</Box>
                                                            </ActionButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Stack>
                                        </StyledTableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <TableCell colSpan={userRole === 'MANAGER' ? 7 : 6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
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
                count={filteredPigPens.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />

            {/* Notification */}
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

            {/* Dialogs */}
            <Dialog
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxWidth: '600px', borderRadius: '8px' } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <AddHomeWorkIcon color="primary" />
                    <Typography variant="h6" component="div">Thêm chuồng nuôi</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <PigPenFormCreate
                        onClose={(success) => {
                            setOpenCreateForm(false);
                            if (success) {
                                showNotification("Thêm chuồng nuôi thành công");
                                fetchPigPens(userRole, employeeId);
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxWidth: '600px', borderRadius: '8px' } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <AddHomeWorkIcon color="primary" />
                    <Typography variant="h6" component="div">Cập nhật chuồng nuôi</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <PigPenFormUpdate
                        pigPenData={selectedPigPen}
                        onClose={(success) => {
                            setOpenUpdateForm(false);
                            setSelectedPigPen(null);
                            if (success) {
                                showNotification("Cập nhật chuồng nuôi thành công");
                                fetchPigPens(userRole, employeeId);
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ sx: { borderRadius: '8px' } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa chuồng nuôi này không?
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

            {/* Hộp thoại xác nhận rời chuồng */}
            <Dialog
                open={leaveDialog.open}
                onClose={handleLeavePenCancel}
                aria-labelledby="leave-dialog-title"
                aria-describedby="leave-dialog-description"
                PaperProps={{ sx: { borderRadius: '8px' } }}
            >
                <DialogTitle id="leave-dialog-title" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    Xác nhận rời chuồng
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText id="leave-dialog-description">
                        Bạn có chắc chắn muốn rời khỏi chuồng "{leaveDialog.penName}" không?
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            Lưu ý: Bạn sẽ không còn là người chăm sóc của chuồng này nữa!
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleLeavePenCancel} color="primary" variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleLeavePenConfirm} color="error" variant="contained" autoFocus>
                        Xác nhận rời
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}