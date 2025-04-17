import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeService } from "../../services/employeeService";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
    Divider, Tooltip, Dialog, DialogTitle, DialogContent, Snackbar, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { Edit } from "@mui/icons-material";
import EmployeeFormUpdate from "./EmployeeFormUpdate.jsx";

const EmployeeDetail = () => {
    const employeeId = localStorage.getItem('employeeId');
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const fetchEmployee = async () => {
        try {
            const res = await employeeService.getById(employeeId);
            setEmployee(res.data);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployee();
    }, [employeeId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!employee) {
        return <Typography align="center">Không tìm thấy nhân viên</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, bgcolor: "#f9f9f9" }}>
                <CardContent>
                    <Grid container spacing={4}>
                        {/* Avatar and basic info */}
                        <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                            <Avatar
                                src={employee.imagePath ? `http://localhost:8080/${employee.imagePath}` : ""}
                                alt={employee.fullName}
                                sx={{ width: 160, height: 160, mx: "auto", mb: 2, borderRadius: "50%" }}
                            />
                            <Typography variant="h6" fontWeight="bold">{employee.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {employee.role === "MANAGER" ? "Quản lý" : "Nhân viên"}
                            </Typography>
                        </Grid>

                        {/* Employee details */}
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
                                Thông tin chi tiết
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {[
                                { label: "Mã nhân viên", value: employee.employeeId },
                                { label: "Username", value: employee.username },
                                { label: "Email", value: employee.email },
                                { label: "Ngày sinh", value: new Date(employee.birthDate).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    }) },
                                {
                                    label: "Giới tính",
                                    value: employee.gender === "MALE"
                                        ? "Nam"
                                        : employee.gender === "FEMALE"
                                            ? "Nữ"
                                            : "Khác"
                                },
                                { label: "Số CMND/CCCD", value: employee.idCardNumber },
                            ].map((item, index) => (
                                <Box key={index} sx={{ mb: 1.5 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold" }}>
                                                {item.label}:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{item.value}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>

                    {/* Action buttons */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/dashboard')}
                            sx={{ padding: "6px 16px", textTransform: "none", fontWeight: "bold" }}
                        >
                            Quay lại
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                setSelectedEmployee(employee);
                                setOpenUpdateForm(true);
                            }}
                            sx={{ padding: "6px 16px", textTransform: "none", fontWeight: "bold" }}
                        >
                            Chỉnh sửa
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Update Form Dialog */}
            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '600px',
                        borderRadius: '8px',
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Edit color="primary" />
                    <Typography variant="h6">Cập nhật nhân viên</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <EmployeeFormUpdate
                        employeeData={selectedEmployee}
                        onClose={(success) => {
                            setOpenUpdateForm(false);
                            setSelectedEmployee(null);
                            if (success) {
                                showNotification("Cập nhật nhân viên thành công");
                                fetchEmployee();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

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
        </Box>
    );
};

export default EmployeeDetail;
