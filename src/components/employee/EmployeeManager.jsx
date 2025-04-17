import React, { useEffect, useState } from "react";
import { employeeService } from "../../services/EmployeeService.js";
import "../styles/EmployeeManager.css";
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
    TablePagination,
    Tooltip
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    ArrowBack,
    PersonAdd
} from "@mui/icons-material";
import EmployeeFormUpdate from "./EmployeeFormUpdate.jsx";
import EmployeeFormCreate from "./EmployeeFormCreate.jsx";
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

const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2)
}));

export default function EmployeeManager() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        employeeId: null
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (searchKeyword.trim() === '') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(
                (e) => e.fullName?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    }, [searchKeyword, employees]);

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            const filteredList = res.data.filter(e => e.role?.toLowerCase() !== "manager");
            setEmployees(filteredList);
            setFilteredEmployees(filteredList);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách nhân viên:", err);
            showNotification("Không thể tải danh sách nhân viên", "error");
        }
    };

    const handleSearch = async () => {
        try {
            const res = await employeeService.search({ name: searchKeyword , id: searchKeyword});
            setEmployees(res.data);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm nhân viên:", err);
        }
    };

    const handleSearchChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
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
        setDeleteDialog({
            open: true,
            employeeId: id
        });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            employeeId: null
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await employeeService.delete(deleteDialog.employeeId);
            setEmployees((prev) => prev.filter((e) => e.employeeId !== deleteDialog.employeeId));
            showNotification("Xóa nhân viên thành công");
        } catch (err) {
            console.error("Lỗi khi xoá nhân viên:", err);
            showNotification("Lỗi khi xóa nhân viên", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    const paginatedEmployees = filteredEmployees.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ py: 2 }}>

            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý nhân viên</h1>
            </Stack>

            {/* Search & Add section */}
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                }}
                className="search-container"
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <TextField
                        label="Tìm theo tên"
                        variant="outlined"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        sx={{ flexGrow: 1 }}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Search />}
                        onClick={handleSearch}
                        sx={{
                            flexShrink: 0,
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>


            {/* Counter */}
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tổng số nhân viên: {filteredEmployees.length}
                <div>
                    <Button
                    variant="contained"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => setOpenCreateForm(true)}
                    sx={{
                        flexShrink: 0,
                        fontWeight: 'bold',
                        backgroundColor: '#1E8449',
                        '&:hover': {
                            backgroundColor: '#155d32'
                        },
                        textTransform: 'uppercase'
                    }}
                >
                    Thêm nhân viên
                </Button>
                </div>
            </Typography>

            {/* Employee Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 2,
                    mb: 2
                }}
                className="table-container"
            >
                <Table sx={{ minWidth: 650 }} aria-label="employee table" className="employee-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Mã nhân viên</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Họ và tên</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Tài khoản</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Email</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày sinh</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Giới tính</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số CCCD/CMND</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Hành động</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((e, index) => (
                                <TableRow
                                    key={e.employeeId}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                        '&:hover': { backgroundColor: '#f0f7ff' },
                                        animation: 'fadeIn 0.3s ease forwards'
                                    }}
                                >
                                    <StyledTableCell>{e.employeeId}</StyledTableCell>
                                    <StyledTableCell sx={{ fontWeight: 'medium' }}>{e.fullName}</StyledTableCell>
                                    <StyledTableCell>{e.username}</StyledTableCell>
                                    <StyledTableCell>{e.email}</StyledTableCell>
                                    <StyledTableCell>{formatDate(e.birthDate)}</StyledTableCell>
                                    <StyledTableCell>
                                        {e.gender === "MALE"
                                            ? "Nam"
                                            : e.gender === "FEMALE"
                                                ? "Nữ"
                                                : "Khác"}
                                    </StyledTableCell>
                                    <StyledTableCell>{e.idCardNumber}</StyledTableCell>
                                    <StyledTableCell>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Sửa thông tin">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="warning"
                                                    className="action-button"
                                                    onClick={() => {
                                                        setSelectedEmployee(e);
                                                        setOpenUpdateForm(true);
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                    <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>SỬA</Box>
                                                </ActionButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa nhân viên">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    className="action-button"
                                                    onClick={() => handleDeleteClick(e.employeeId)}
                                                >
                                                    <Delete fontSize="small" />
                                                    <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>XÓA</Box>
                                                </ActionButton>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu nhân viên
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
                count={filteredEmployees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />

            {/* Snackbar for notifications */}
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

            {/* Dialog form to add employee */}
            <Dialog
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '600px',
                        borderRadius: '8px'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0'
                    }}
                >
                    <PersonAdd color="primary" />
                    <Typography variant="h6" component="div">Thêm nhân viên</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <EmployeeFormCreate
                        onClose={(success) => {
                            setOpenCreateForm(false);
                            if (success) {
                                showNotification("Thêm nhân viên thành công");
                                fetchEmployees();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog form to update employee */}
            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '600px',
                        borderRadius: '8px'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0'
                    }}
                >
                    <Edit color="primary" />
                    <Typography variant="h6" component="div">Cập nhật nhân viên</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <EmployeeFormUpdate
                        employeeData={selectedEmployee}
                        onClose={(success) => {
                            setOpenUpdateForm(false);
                            setSelectedEmployee(null);
                            if (success) {
                                showNotification("Cập nhật nhân viên thành công");
                                fetchEmployees();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

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
                        Bạn có chắc chắn muốn xóa nhân viên này không?
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