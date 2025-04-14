import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    DialogActions,
    Typography,
} from "@mui/material";
import { employeeService } from "../../services/employeeService";

// Trạng thái mặc định của nhân viên
const initialState = {
    fullName: "",
    username: "",
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
};

const EmployeeFormCreate = ({ onClose = () => {} }) => {
    const [employee, setEmployee] = useState(initialState);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cập nhật trường nhập liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý khi chọn file ảnh
    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
    };

    // Gửi form lên server
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

            await employeeService.create(formData); // gọi API thêm nhân viên
            onClose(true); // đóng dialog + báo thành công
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
            onClose(false); // báo thất bại
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
        >
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

            <Box>
                <Typography variant="body2" gutterBottom>
                    Ảnh đại diện
                </Typography>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {avatar && <Typography fontSize={12}>Đã chọn: {avatar.name}</Typography>}
            </Box>

            <DialogActions>
                <Button onClick={() => onClose(false)} color="secondary">
                    Hủy
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Thêm mới"}
                </Button>
            </DialogActions>
        </Box>
    );
};

export default EmployeeFormCreate;
