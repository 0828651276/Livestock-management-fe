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
    Typography,
    IconButton
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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            setEmployees(res.data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách nhân viên:", err);
        }
    };

    const handleSearch = async () => {
        try {
            const res = await employeeService.search({ name: searchKeyword });
            setEmployees(res.data);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm nhân viên:", err);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xoá nhân viên này?")) {
            try {
                await employeeService.delete(id);
                setEmployees((prev) => prev.filter((e) => e.employeeId !== id));
            } catch (err) {
                console.error("Lỗi khi xoá nhân viên:", err);
            }
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
                                                onClick={() => handleDelete(e.employeeId)}
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

            {/* Dialog form thêm/sửa nhân viên */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonAddIcon />
                    {selectedEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </DialogTitle>
                <DialogContent>
                    <EmployeeForm
                        employeeData={selectedEmployee}
                        onClose={() => {
                            setOpenForm(false);
                            setSelectedEmployee(null);
                            fetchEmployees(); // reload danh sách sau khi cập nhật
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
