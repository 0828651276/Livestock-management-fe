import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    DialogActions
} from "@mui/material";
import { employeeService } from "../../services/employeeService";

const initialState = {
    fullName: "",
    username: "",
    password: "",
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
    role: "STAFF",
};

const EmployeeForm = ({ onClose, employeeData }) => {
    const [employee, setEmployee] = useState(initialState);
    const [loading, setLoading] = useState(false);

    // Nếu có employeeData (chế độ cập nhật), set dữ liệu vào form
    useEffect(() => {
        if (employeeData) {
            setEmployee({ ...employeeData, password: "" }); // không điền password ra form
        }
    }, [employeeData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (employeeData) {
                // Cập nhật
                await employeeService.update(employee.employeeId, employee);
            } else {
                // Thêm mới
                await employeeService.create(employee);
            }
            onClose(true); // Truyền true để chỉ ra thành công
        } catch (error) {
            console.error(error);
            onClose(false); // Truyền false nếu có lỗi
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
            <TextField label="Họ tên" name="fullName" value={employee.fullName} onChange={handleChange} required />
            <TextField label="Tên đăng nhập" name="username" value={employee.username} onChange={handleChange} required />
            <TextField
                label="Mật khẩu"
                type="password"
                name="password"
                value={employee.password}
                onChange={handleChange}
                required={!employeeData} // nếu là tạo mới thì bắt buộc nhập mật khẩu
            />
            <TextField label="Email" type="email" name="email" value={employee.email} onChange={handleChange} required />
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
            <TextField label="Số CCCD" name="idCardNumber" value={employee.idCardNumber} onChange={handleChange} required />

            <DialogActions>
                <Button onClick={() => onClose?.()} color="secondary">
                    Hủy
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (employeeData ? "Cập nhật" : "Lưu nhân viên")}
                </Button>
            </DialogActions>
        </Box>
    );
};

export default EmployeeForm;