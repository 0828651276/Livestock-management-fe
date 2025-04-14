import React, { useState, useEffect } from "react";
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

const initialState = {
    fullName: "",
    username: "",
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
};

const EmployeeFormUpdate = ({ onClose, employeeData }) => {
    const [employee, setEmployee] = useState(initialState);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employeeData) {
            setEmployee({ ...employeeData });
        }
    }, [employeeData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            // Append all employee fields
            Object.entries(employee).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            // Append avatar if selected
            if (avatar) {
                formData.append("avatar", avatar);
            }

            await employeeService.update(employee.employeeId, formData);
            onClose(true); // success
        } catch (error) {
            console.error("Lỗi khi lưu nhân viên:", error);
            onClose(false); // error
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
                <Button onClick={() => onClose?.()} color="secondary">
                    Hủy
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                </Button>
            </DialogActions>
        </Box>
    );
};

export default EmployeeFormUpdate;
