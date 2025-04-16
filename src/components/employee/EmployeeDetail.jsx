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
    Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

const EmployeeDetail = () => {
    const employeeId = localStorage.getItem('employeeId'); // Lấy mã nhân viên từ localStorage
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Quay lại
            </Button>

            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={4}>
                        {/* Avatar bên trái */}
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

                        {/* Thông tin bên phải */}
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
                                    { label: "Giới tính",
                                        value: employee.gender === "MALE"
                                            ? "Nam"
                                            : employee.gender === "FEMALE"
                                                ? "Nữ"
                                                : "Khác"},
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

                    {/* Nút chỉnh sửa */}
                    <Box sx={{ textAlign: "right", mt: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/employees/update/${employee.employeeId}`)}
                        >
                            Chỉnh sửa
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EmployeeDetail;
