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
    InputAdornment
} from "@mui/material";
import { animalService } from "../../services/animalService";
import { pigPenService } from "../../services/pigPenService";
import "../styles/FormValidation.css";
import { validateAnimalForm } from "../../utils/validateUtils";

const initialState = {
    name: "",
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: "",
    status: "ACTIVE",
    weight: "",
    penId: "",
    quantity: 1
};

const AnimalFormCreate = ({ onClose }) => {
    const [animal, setAnimal] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [pigPens, setPigPens] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    useEffect(() => {
        // Lấy vai trò và ID nhân viên từ localStorage
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role);
        setEmployeeId(id);

        fetchPigPens(role, id);
    }, []);

    const fetchPigPens = async (role, id) => {
        try {
            // Get empty pens regardless of role
            const emptyPens = await animalService.getEmptyPens();

            // If user is EMPLOYEE, filter the empty pens to only show ones they care for
            if (role !== 'MANAGER') {
                const userPens = await pigPenService.findByEmployeeId(id);
                const userPenIds = userPens.map(pen => pen.penId);

                // Filter empty pens to only include those assigned to this employee
                const filteredPens = emptyPens.filter(pen =>
                    userPenIds.includes(pen.penId)
                );

                setPigPens(filteredPens);
            } else {
                // For managers, show all empty pens
                setPigPens(emptyPens);
            }
        } catch (error) {
            console.error("Error fetching empty pig pens:", error);
            setServerError("Could not load pig pen data.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnimal((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Validate form
        const { isValid, errors: validationErrors } = validateAnimalForm(animal);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            // Make sure weight is converted to proper format
            const animalData = {
                ...animal,
                weight: parseFloat(animal.weight)
            };

            await animalService.createAnimal(animalData);
            onClose(true);
        } catch (error) {
            console.error("Error creating animal:", error);
            setServerError(error.response?.data?.error || "Could not create animal. Please try again.");
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
                THÔNG TIN CON VẬT
            </Typography>

            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }} className="form-error-alert">
                    {serverError}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Tên"
                    name="name"
                    value={animal.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.name ? "field-error" : ""}
                    fullWidth
                />

                {pigPens.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Không có chuồng trống. Vui lòng tạo chuồng mới trước khi thêm động vật.
                    </Alert>
                ) : (
                    <FormControl fullWidth required error={!!errors.penId}>
                        <InputLabel id="penId-label">Chuồng nuôi</InputLabel>
                        <Select
                            labelId="penId-label"
                            name="penId"
                            value={animal.penId}
                            label="Chuồng nuôi"
                            onChange={handleChange}
                        >
                            <MenuItem value="" disabled>
                                <em>Chọn chuồng nuôi</em>
                            </MenuItem>
                            {pigPens.map((pen) => (
                                <MenuItem key={pen.penId} value={pen.penId}>
                                    {pen.name} (Trống)
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                        <FormHelperText>Chỉ hiển thị các chuồng đang trống</FormHelperText>
                    </FormControl>
                )}

                <TextField
                    label="Ngày nhập"
                    name="entryDate"
                    type="date"
                    value={animal.entryDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.entryDate}
                    helperText={errors.entryDate}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.entryDate ? "field-error" : ""}
                />

                <TextField
                    label="Ngày xuất"
                    name="exitDate"
                    type="date"
                    value={animal.exitDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.exitDate}
                    helperText={errors.exitDate || "Để trống nếu chưa xuất chuồng"}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.exitDate ? "field-error" : ""}
                />

                <TextField
                    label="Cân nặng"
                    name="weight"
                    type="number"
                    value={animal.weight}
                    onChange={handleChange}
                    required
                    error={!!errors.weight}
                    helperText={errors.weight}
                    InputProps={{
                        inputProps: { min: 0.1, step: "0.1" },
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.weight ? "field-error" : ""}
                />

                <TextField
                    label="Số lượng"
                    name="quantity"
                    type="number"
                    value={animal.quantity}
                    onChange={handleChange}
                    required
                    error={!!errors.quantity}
                    helperText={errors.quantity}
                    InputProps={{
                        inputProps: { min: 1, max: 1000 },
                    }}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.quantity ? "field-error" : ""}
                />

                <FormControl fullWidth required error={!!errors.status}>
                    <InputLabel id="status-label">Trạng thái</InputLabel>
                    <Select
                        labelId="status-label"
                        name="status"
                        value={animal.status}
                        label="Trạng thái"
                        onChange={handleChange}
                    >
                        <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                        <MenuItem value="SICK">Bị bệnh</MenuItem>
                        <MenuItem value="UNVACCINATED">Chưa tiêm phòng</MenuItem>

                    </Select>
                    {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
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
                        disabled={loading || pigPens.length === 0}
                        sx={{ px: 3, py: 1 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default AnimalFormCreate;