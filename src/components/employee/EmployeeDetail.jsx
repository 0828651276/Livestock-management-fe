// src/pages/EmployeeDetail.jsx
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
    Divider, Tooltip, Dialog, DialogTitle, DialogContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {Edit} from "@mui/icons-material";
import EmployeeFormUpdate from "./EmployeeFormUpdate.jsx";

// ... các import như cũ ...
import { styled } from "@mui/material/styles";

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

    // Styled button
    const ActionButton = styled(Button)(({ theme }) => ({
        minWidth: '32px',
        padding: '6px 12px',
        boxShadow: 'none',
        '&:hover': {
            boxShadow: theme.shadows[2]
        }
    }));

    // Đưa fetchEmployee ra ngoài useEffect
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
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                            <Avatar
                                src={
                                    employee.imagePath
                                        ? `http://localhost:8080/${employee.imagePath}`
                                        : ""
                                }
                                alt={employee.fullName}
                                sx={{ width: 160, height: 160, mx: "auto", mb: 2 }}
                            />
                            <Typography variant="h6">{employee.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {employee.role === "MANAGER" ? "Quản lý" : "Nhân viên"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin chi tiết
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {[
                                    { label: "Mã nhân viên", value: employee.employeeId },
                                    { label: "Username", value: employee.username },
                                    { label: "Email", value: employee.email },
                                    { label: "Ngày sinh", value: employee.birthDate },
                                    {
                                        label: "Giới tính",
                                        value: employee.gender === "MALE"
                                            ? "Nam"
                                            : employee.gender === "FEMALE"
                                                ? "Nữ"
                                                : "Khác"
                                    },
                                    { label: "CMND/CCCD", value: employee.idCardNumber },
                                ].map((item, index) => (
                                    <Box key={index} sx={{ mb: 1.5 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                        <Typography>{item.value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/dashboard')}
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
                        >
                            Chỉnh sửa
                        </Button>
                    </Box>
                </CardContent>
            </Card>

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
        </Box>
    );
};

export default EmployeeDetail;
