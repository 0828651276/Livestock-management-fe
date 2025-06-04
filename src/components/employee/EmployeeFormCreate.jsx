import React, { useState } from "react";
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
    Alert,
} from "@mui/material";
import { employeeService } from "../../services/EmployeeService.js";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import {validateEmployeeForm} from "../../utils/validateUtils.js";

const initialState = {
    fullName: "",
    username: "",
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
};

const EmployeeFormCreate = ({ onClose }) => {
    const [employee, setEmployee] = useState(initialState);
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Validate form using our utility
        const { isValid, errors: validationErrors } = validateEmployeeForm(employee);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            const trimmedEmployee = {
                ...employee,
                fullName: employee.fullName.trim(),
                username: employee.username.trim(),
                email: employee.email.trim(),
                idCardNumber: employee.idCardNumber.trim(),
            };

            formData.append(
                "employee",
                new Blob([JSON.stringify(trimmedEmployee)], {
                    type: "application/json",
                })
            );

            if (avatar) {
                formData.append("avatar", avatar);
            }

            await employeeService.create(formData);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
            setServerError(error.response?.data?.message || "Đã xảy ra lỗi khi tạo nhân viên");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // Calculate max date for birthdate (18 years ago from today)
    const calculateMaxDate = () => {
        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );
        return eighteenYearsAgo.toISOString().split('T')[0];
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
            className="employee-form"
        >
            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            )}

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
                    className={errors.fullName ? "field-error" : ""}
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
                    className={errors.email ? "field-error" : ""}
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
                    helperText={errors.birthDate || "Nhân viên phải đủ 18 tuổi trở lên"}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.birthDate ? "field-error" : ""}
                    inputProps={{ max: calculateMaxDate() }}
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
                        label="Số CCCD/CMND"
                        name="idCardNumber"
                        value={employee.idCardNumber}
                        onChange={handleChange}
                        required
                        fullWidth
                        error={!!errors.idCardNumber}
                        helperText={errors.idCardNumber || "Chấp nhận CMND 9 số hoặc CCCD 12 số"}
                        sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                        className={errors.idCardNumber ? "field-error" : ""}
                    />
                </Box>
            </Box>

            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                TẠO TÀI KHOẢN
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                <TextField
                    label="Tên đăng nhập"
                    name="username"
                    value={employee.username}
                    onChange={handleChange}
                    required
                    error={!!errors.username}
                    helperText={errors.username}
                    sx={{
                        "& .MuiInputBase-input": { py: 1.5 },
                        width: '50%',
                    }}
                    className={errors.username ? "field-error" : ""}
                />
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
                        {loading ? <CircularProgress size={24} /> : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default EmployeeFormCreate;