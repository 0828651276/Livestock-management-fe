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
    Card,
    CardContent,
    CardHeader,
    Divider,
} from "@mui/material";
import { employeeService } from "../../services/employeeService";

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
            sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, p: 2 }}
        >
            {/* Ảnh đại diện bên trái */}
            <Card sx={{ width: 260, textAlign: "center", p: 2 }}>
                <CardHeader title="Ảnh đại diện" />
                <CardContent>
                    <Avatar
                        src={previewUrl}
                        alt="Avatar Preview"
                        sx={{
                            width: 200,
                            height: 200,
                            margin: "0 auto",
                            mb: 1,
                            border: "2px solid #ccc",
                        }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        JPG hoặc PNG không vượt quá 5MB
                    </Typography>
                    <Button variant="contained" component="label" fullWidth>
                        Tải ảnh lên
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </Button>
                    {avatar && (
                        <Typography fontSize={12} mt={1}>
                            Đã chọn: {avatar.name}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Thông tin bên phải */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Họ tên"
                    name="fullName"
                    value={employee.fullName}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Tên đăng nhập"
                    name="username"
                    value={employee.username}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Ngày sinh"
                    type="date"
                    name="birthDate"
                    value={employee.birthDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField select label="Giới tính" name="gender" value={employee.gender} onChange={handleChange}>
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
                />

                <Divider sx={{ my: 2 }} />

                <DialogActions sx={{ justifyContent: "flex-end" }}>
                    <Button onClick={() => onClose(false)} color="secondary">
                        Hủy
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default EmployeeFormCreate;
