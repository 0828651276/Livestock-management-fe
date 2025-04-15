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
} from "@mui/material";
import { employeeService } from "../../services/EmployeeService.js";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("employee", new Blob([JSON.stringify(employee)], {
                type: "application/json",
            }));
            if (avatar) {
                formData.append("avatar", avatar);
            }

            await employeeService.create(formData);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
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
                flexDirection: { xs: "column", md: "column" },
                gap: 2,
                p: 4,
                minHeight: "600px",
            }}
        >
            {/* Avatar nhỏ hơn */}
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
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    required
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
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />
                <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                    <TextField
                        select
                        label="Giới tính"
                        name="gender"
                        value={employee.gender}
                        onChange={handleChange}
                        sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                        fullWidth
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
                        sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                        fullWidth
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
                    sx={{ 
                        "& .MuiInputBase-input": { py: 1.5 },
                        width: '50%'  // Đặt độ rộng bằng một nửa container
                    }}
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