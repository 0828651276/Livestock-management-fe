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
    Alert,
    Chip,
    OutlinedInput
} from "@mui/material";
import { pigPenService } from "../../services/pigPenService";
import { employeeService } from "../../services/employeeService";
import "../styles/FormValidation.css";
import {validatePigPenForm} from "../../utils/validateUtils.js";

const initialState = {
    name: "",
    caretakers: [],
    createdDate: new Date().toISOString().split('T')[0],
    closedDate: "",
    quantity: 0,
    status: "ACTIVE"
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const PigPenFormCreate = ({ onClose }) => {
    const [pigPen, setPigPen] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({
        name: "",
        createdDate: "",
        closedDate: "",
        quantity: "",
        status: ""
    });
    const [serverError, setServerError] = useState("");
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role);
        setEmployeeId(id);
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            // Chỉ lấy nhân viên không phải quản lý
            const filteredEmployees = res.data.filter(emp => emp.role !== "MANAGER");
            setEmployees(filteredEmployees);

            // Nếu là nhân viên, tự động gán họ làm người chăm sóc
            if (userRole !== 'MANAGER') {
                const currentEmployee = filteredEmployees.find(emp => emp.employeeId === employeeId);
                if (currentEmployee) {
                    setPigPen(prev => ({
                        ...prev,
                        caretakers: [{
                            employeeId: currentEmployee.employeeId,
                            fullName: currentEmployee.fullName
                        }]
                    }));
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            setServerError("Không thể tải danh sách nhân viên.");
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

    const handleCaretakersChange = (event) => {
        const { value } = event.target;

        // Chuyển đổi giá trị ID thành đối tượng nhân viên đầy đủ
        const selectedEmployees = value.map(id =>
            employees.find(emp => emp.employeeId === id)
        ).filter(Boolean); // Lọc ra những giá trị null hoặc undefined

        setPigPen(prev => ({
            ...prev,
            caretakers: selectedEmployees
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Validate form
        const { isValid, errors: validationErrors } = validatePigPenForm(pigPen);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            // Nếu là nhân viên và chưa có người chăm sóc, tự động gán họ làm người chăm sóc
            if (userRole !== 'MANAGER' && (!pigPen.caretakers || pigPen.caretakers.length === 0)) {
                const currentEmployee = employees.find(emp => emp.employeeId === employeeId);
                if (currentEmployee) {
                    pigPen.caretakers = [{
                        employeeId: currentEmployee.employeeId,
                        fullName: currentEmployee.fullName
                    }];
                }
            }

            await pigPenService.createPigPen(pigPen);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi tạo chuồng nuôi:", error);
            setServerError("Không thể tạo chuồng nuôi. Vui lòng thử lại.");
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
            className="pen-form"
        >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                THÔNG TIN CHUỒNG NUÔI
            </Typography>

            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }} className="form-error-alert">
                    {serverError}
                </Alert>
            )}

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
                    className={errors.name ? "field-error" : ""}
                    fullWidth
                />

                {userRole === 'MANAGER' && (
                    <FormControl fullWidth sx={{ "& .MuiInputBase-input": { py: 1.5 } }}>
                        <InputLabel id="caretakers-label">Người chăm sóc</InputLabel>
                        <Select
                            labelId="caretakers-label"
                            multiple
                            value={pigPen.caretakers.map(ct => ct.employeeId)}
                            onChange={handleCaretakersChange}
                            input={<OutlinedInput label="Người chăm sóc" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const employee = employees.find(emp => emp.employeeId === value);
                                        return (
                                            <Chip
                                                key={value}
                                                label={employee ? employee.fullName : value}
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            <MenuItem disabled value="">
                                <em>Chọn người chăm sóc</em>
                            </MenuItem>
                            {employees.map((employee) => (
                                <MenuItem
                                    key={employee.employeeId}
                                    value={employee.employeeId}
                                >
                                    {employee.fullName}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Có thể chọn nhiều người chăm sóc</FormHelperText>
                    </FormControl>
                )}

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
                    className={errors.createdDate ? "field-error" : ""}
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
                    className={errors.closedDate ? "field-error" : ""}
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
                    className={errors.quantity ? "field-error" : ""}
                />

                <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            name="status"
                            value={pigPen.status}
                            onChange={handleChange}
                            label="Trạng thái"
                        >
                            <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                            <MenuItem value="CLOSED">Đã đóng</MenuItem>
                        </Select>
                        {errors.status && (
                            <FormHelperText error>{errors.status}</FormHelperText>
                        )}
                    </FormControl>
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
                        {loading ? <CircularProgress size={24} /> : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default PigPenFormCreate;
