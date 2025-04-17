import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    DialogActions,
    Typography,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
} from "@mui/material";
import { pigPenService } from "../../services/pigPenService";
import { employeeService } from "../../services/employeeService";

const initialState = {
    name: "",
    caretaker: null,
    createdDate: new Date().toISOString().split('T')[0],
    closedDate: "",
    quantity: 0
};

const PigPenFormCreate = ({ onClose }) => {
    const [pigPen, setPigPen] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({
        name: "",
        createdDate: "",
        closedDate: "",
        quantity: ""
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            setEmployees(res.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPigPen((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        const selectedEmployee = employees.find(emp => emp.employeeId === employeeId);

        setPigPen(prev => ({
            ...prev,
            caretaker: selectedEmployee || null
        }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        // Validate name
        if (!pigPen.name.trim()) {
            newErrors.name = "Tên chuồng không được để trống";
            isValid = false;
        }

        // Validate createdDate
        if (!pigPen.createdDate) {
            newErrors.createdDate = "Ngày tạo không được để trống";
            isValid = false;
        } else {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const createdDate = new Date(pigPen.createdDate);

            if (createdDate > currentDate) {
                newErrors.createdDate = "Ngày tạo không thể là ngày trong tương lai";
                isValid = false;
            }
        }

        // Validate closedDate if provided
        if (pigPen.closedDate) {
            const createdDate = new Date(pigPen.createdDate);
            const closedDate = new Date(pigPen.closedDate);

            if (closedDate < createdDate) {
                newErrors.closedDate = "Ngày đóng phải sau ngày tạo";
                isValid = false;
            }
        }

        // Validate quantity
        if (pigPen.quantity < 0) {
            newErrors.quantity = "Số lượng không thể là số âm";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await pigPenService.createPigPen(pigPen);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi thêm chuồng nuôi:", error);
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
                minHeight: "400px",
            }}
        >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                THÔNG TIN CHUỒNG NUÔI
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Tên chuồng"
                    name="name"
                    value={pigPen.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />

                <FormControl fullWidth sx={{ "& .MuiInputBase-input": { py: 1.5 } }}>
                    <InputLabel id="caretaker-label">Người chăm sóc</InputLabel>
                    <Select
                        labelId="caretaker-label"
                        value={pigPen.caretaker ? pigPen.caretaker.employeeId : ""}
                        onChange={handleEmployeeChange}
                        label="Người chăm sóc"
                    >
                        <MenuItem value="">
                            <em>Chưa phân công</em>
                        </MenuItem>
                        {employees
                            .filter(emp => emp.role !== "MANAGER")
                            .map(employee => (
                                <MenuItem key={employee.employeeId} value={employee.employeeId}>
                                    {employee.fullName}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Ngày tạo"
                    name="createdDate"
                    type="date"
                    value={pigPen.createdDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.createdDate}
                    helperText={errors.createdDate}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />

                <TextField
                    label="Ngày đóng"
                    name="closedDate"
                    type="date"
                    value={pigPen.closedDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.closedDate}
                    helperText={errors.closedDate || "Để trống nếu chuồng vẫn đang hoạt động"}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />

                <TextField
                    label="Số lượng"
                    name="quantity"
                    type="number"
                    value={pigPen.quantity}
                    onChange={handleChange}
                    required
                    error={!!errors.quantity}
                    helperText={errors.quantity}
                    InputProps={{ inputProps: { min: 0 } }}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
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

export default PigPenFormCreate;