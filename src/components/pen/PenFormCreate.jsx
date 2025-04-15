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
    };

    const handleEmployeeChange = (e) => {
        const employeeId = e.target.value;
        const selectedEmployee = employees.find(emp => emp.employeeId === employeeId);

        setPigPen(prev => ({
            ...prev,
            caretaker: selectedEmployee || null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                />

                <TextField
                    label="Ngày đóng"
                    name="closedDate"
                    type="date"
                    value={pigPen.closedDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    helperText="Để trống nếu chuồng vẫn đang hoạt động"
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