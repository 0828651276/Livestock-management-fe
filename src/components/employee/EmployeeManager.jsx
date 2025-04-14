import React, { useEffect, useState } from "react";
import { employeeService } from "../../services/EmployeeService.js";
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
    Alert
} from "@mui/material";
import { Add, Edit, Delete, Search, ArrowBack } from "@mui/icons-material";
import EmployeeForm from "./EmployeeForm.jsx";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

export default function EmployeeManager() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openForm, setOpenForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        employeeId: null
    });

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

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            setEmployees(res.data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách nhân viên:", err);
            showNotification("Không thể tải danh sách nhân viên", "error");
        }
    };

    const handleSearch = async () => {
        try {
            const res = await employeeService.search({ name: searchKeyword });
            setEmployees(res.data);
            if (res.data.length === 0) {
                showNotification("Không tìm thấy nhân viên nào", "info");
            }
        } catch (err) {
            console.error("Lỗi khi tìm kiếm nhân viên:", err);
            showNotification("Lỗi khi tìm kiếm nhân viên", "error");
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN");
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

    return (
        <Box sx={{ p: 4 }}>
            {/* Header với nút quay lại */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <IconButton 
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                        color: '#1E8449',
                        '&:hover': {
                            backgroundColor: 'rgba(30, 132, 73, 0.08)'
                        }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" component="h1">
                    Quản lý nhân viên
                </Typography>
            </Stack>

            {/* Menu */}
            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="contained" color="primary">
                    Quản lý nhân viên
                </Button>
                <Button variant="outlined" color="primary">
                    Đăng thông báo
                </Button>
            </Stack>

            {/* Thanh tìm kiếm + nút thêm */}
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <TextField
                    label="Tìm theo tên"
                    variant="outlined"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    sx={{ width: 300 }}
                />
                <Button variant="contained" color="primary" startIcon={<Search />} onClick={handleSearch}>
                    Tìm kiếm
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => {
                        setSelectedEmployee(null); // reset khi thêm mới
                        setOpenForm(true);
                    }}
                >
                    Thêm
                </Button>
            </Stack>

            {/* Bảng danh sách */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="employee table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã nhân viên</TableCell>
                            <TableCell>Họ và tên</TableCell>
                            <TableCell>Tài khoản</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Ngày sinh</TableCell>
                            <TableCell>Giới tính</TableCell>
                            <TableCell>CMND</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees
                            .filter((e) => e.role?.toLowerCase() !== "manager")
                            .map((e, index) => (
                                <TableRow
                                    key={e.employeeId}
                                    sx={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}
                                >
                                    <TableCell>{e.employeeId}</TableCell>
                                    <TableCell>{e.fullName}</TableCell>
                                    <TableCell>{e.username}</TableCell>
                                    <TableCell>{e.email}</TableCell>
                                    <TableCell>{formatDate(e.birthDate)}</TableCell>
                                    <TableCell>
                                        {e.gender === "MALE"
                                            ? "Nam"
                                            : e.gender === "FEMALE"
                                                ? "Nữ"
                                                : "Khác"}
                                    </TableCell>
                                    <TableCell>{e.idCardNumber}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                startIcon={<Edit />}
                                                onClick={() => {
                                                    setSelectedEmployee(e);
                                                    setOpenForm(true);
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Delete />}
                                                onClick={() => handleDeleteClick(e.employeeId)}
                                            >
                                                Xoá
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

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

            {/* Dialog form thêm/sửa nhân viên */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonAddIcon />
                    {selectedEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </DialogTitle>
                <DialogContent>
                    <EmployeeForm
                        employeeData={selectedEmployee}
                        onClose={(success) => {
                            setOpenForm(false);
                            setSelectedEmployee(null);
                            if (success) {
                                showNotification(selectedEmployee ? "Cập nhật nhân viên thành công" : "Thêm nhân viên thành công");
                                fetchEmployees();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa nhân viên này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
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
