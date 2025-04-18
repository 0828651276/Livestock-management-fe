import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    DialogActions,
    Typography,
    Avatar,
    IconButton,
} from "@mui/material";
import { employeeService } from "../../services/EmployeeService.js";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const initialState = {
    imagePath: "",
    fullName: "",
    username: "",
    password: "",
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
};

const EmployeeFormUpdate = ({ onClose, employeeData }) => {
    const [employee, setEmployee] = useState(initialState);
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (employeeData) {
            setEmployee({ ...employeeData });
            if (employeeData.imagePath) {
                setPreviewUrl(`http://localhost:8080/${employeeData.imagePath}`);
            }
        }
    }, [employeeData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const idCardRegex = /^\d{9,12}$/;

        if (!employee.fullName.trim()) {
            newErrors.fullName = "Họ tên không được để trống.";
        }

        if (!employee.email.trim()) {
            newErrors.email = "Email không được để trống.";
        } else if (!emailRegex.test(employee.email)) {
            newErrors.email = "Email không hợp lệ.";
        }

        if (!employee.birthDate) {
            newErrors.birthDate = "Vui lòng chọn ngày sinh.";
        }

        if (!employee.idCardNumber.trim()) {
            newErrors.idCardNumber = "CCCD không được để trống.";
        } else if (!idCardRegex.test(employee.idCardNumber)) {
            newErrors.idCardNumber = "CCCD phải từ 9-12 chữ số.";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const formData = new FormData();
            const trimmedEmployee = {
                ...employee,
                fullName: employee.fullName.trim(),
                email: employee.email.trim(),
                idCardNumber: employee.idCardNumber.trim(),
            };

            Object.entries(trimmedEmployee).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (avatar) {
                formData.append("avatar", avatar);
            }

            await employeeService.update(employee.employeeId, formData);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi lưu nhân viên:", error);
            onClose(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 4,
                minHeight: "600px",
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    mb: 2,
                    position: "relative",
                    width: "fit-content",
                    margin: "0 auto",
                }}
            >
                <Avatar
                    src={previewUrl}
                    alt="Avatar"
                    sx={{
                        width: 100,
                        height: 100,
                        border: "2px solid #ccc",
                    }}
                />
                <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        right: -10,
                        backgroundColor: "#1976d2",
                        "&:hover": {
                            backgroundColor: "#1565c0",
                        },
                    }}
                >
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <PhotoCamera sx={{ color: "white" }} />
                </IconButton>
            </Box>

            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                THÔNG TIN CƠ BẢN
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Họ tên"
                    name="fullName"
                    value={employee.fullName}
                    onChange={handleChange}
                    required
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />
                <TextField
                    label="Ngày sinh"
                    type="date"
                    name="birthDate"
                    value={employee.birthDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.birthDate}
                    helperText={errors.birthDate}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />
                <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                    <TextField
                        select
                        label="Giới tính"
                        name="gender"
                        value={employee.gender}
                        onChange={handleChange}
                        fullWidth
                        sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    >
                        <MenuItem value="MALE">Nam</MenuItem>
                        <MenuItem value="FEMALE">Nữ</MenuItem>
                        <MenuItem value="OTHER">Khác</MenuItem>
                    </TextField>
                    <TextField
                        label="Số CCCD"
                        name="idCardNumber"
                        value={employee.idCardNumber}
                        onChange={handleChange}
                        required
                        error={!!errors.idCardNumber}
                        helperText={errors.idCardNumber}
                        fullWidth
                        sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    />
                </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
                <DialogActions sx={{ justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        onClick={() => onClose(false)}
                        color="error"
                        sx={{ px: 3, py: 1 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ px: 3, py: 1 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default EmployeeFormUpdate;
