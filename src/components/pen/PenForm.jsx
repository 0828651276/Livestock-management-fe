// PenForm.jsx
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
    Select
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

const PenForm = ({ onClose, pigPenData = null, isUpdateMode = false }) => {
    const [pigPen, setPigPen] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
        if (pigPenData && isUpdateMode) {
            setPigPen({
                ...pigPenData,
                createdDate: pigPenData.createdDate ? new Date(pigPenData.createdDate).toISOString().split('T')[0] : "",
                closedDate: pigPenData.closedDate ? new Date(pigPenData.closedDate).toISOString().split('T')[0] : "",
            });
        }
    }, [pigPenData, isUpdateMode]);

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
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        const selectedEmployee = employees.find(emp => emp.employeeId === employeeId);
        setPigPen(prev => ({ ...prev, caretaker: selectedEmployee || null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isUpdateMode) {
                await pigPenService.update(pigPen.penId, pigPen);
            } else {
                await pigPenService.create(pigPen);
            }
            onClose(true);
        } catch (error) {
            console.error(isUpdateMode ? "Lỗi khi cập nhật chuồng nuôi:" : "Lỗi khi thêm chuồng nuôi:", error);
            onClose(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, p: 4, minHeight: "400px" }}
        >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {isUpdateMode ? "CẬP NHẬT CHUỒNG NUÔI" : "THÊM CHUỒNG NUÔI"}
            </Typography>

            <TextField
                label="Tên chuồng"
                name="name"
                value={pigPen.name}
                onChange={handleChange}
                required
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
                        .map(emp => (
                            <MenuItem key={emp.employeeId} value={emp.employeeId}>
                                {emp.fullName}
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
                sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
            />

            <TextField
                label="Ngày đóng"
                name="closedDate"
                type="date"
                value={pigPen.closedDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Để trống nếu chuồng vẫn đang hoạt động"
                sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
            />

            <TextField
                label="Số lượng"
                name="quantity"
                type="number"
                value={pigPen.quantity}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
            />

            <DialogActions sx={{ justifyContent: "flex-end", gap: 2 }}>
                <Button onClick={() => onClose(false)} color="error" sx={{ px: 3, py: 1 }}>
                    Hủy
                </Button>
                <Button type="submit" variant="contained" disabled={loading} sx={{ px: 3, py: 1 }}>
                    {loading ? <CircularProgress size={24} /> : isUpdateMode ? "Cập nhật" : "Thêm mới"}
                </Button>
            </DialogActions>
        </Box>
    );
};

export default PenForm;
