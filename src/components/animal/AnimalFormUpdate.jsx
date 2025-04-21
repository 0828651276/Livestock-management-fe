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
    entryDate: "",
    exitDate: "",
    status: "ACTIVE",
    weight: "",
    penId: "",
    quantity: 1
};

const AnimalFormUpdate = ({ onClose, animalData }) => {
    const [animal, setAnimal] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [pigPens, setPigPens] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [originalPenId, setOriginalPenId] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    useEffect(() => {
        // Lấy vai trò và ID nhân viên từ localStorage
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role);
        setEmployeeId(id);

        fetchPigPens(role, id);

        if (animalData) {
            // Format dates for form inputs
            const formattedAnimal = {
                ...animalData,
                entryDate: animalData.entryDate ? new Date(animalData.entryDate).toISOString().split('T')[0] : "",
                exitDate: animalData.exitDate ? new Date(animalData.exitDate).toISOString().split('T')[0] : "",
                penId: animalData.pigPen?.penId || "",
                quantity: animalData.quantity || 1 // Đảm bảo quantity có giá trị mặc định
            };
            setAnimal(formattedAnimal);
            setOriginalPenId(animalData.pigPen?.penId);
        }
    }, [animalData]);

    const fetchPigPens = async (role, id) => {
        try {
            let pens;
            // Nếu là MANAGER, lấy tất cả chuồng active
            if (role === 'MANAGER') {
                pens = await pigPenService.getAllPigPens();
            }
            // Nếu là EMPLOYEE, chỉ lấy chuồng mà họ chăm sóc
            else {
                pens = await pigPenService.findByEmployeeId(id);
            }

            // Filter only active pens
            const activePens = pens.filter(pen => pen.status === "ACTIVE");
            setPigPens(activePens);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chuồng:", error);
            setServerError("Không thể tải dữ liệu chuồng nuôi.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnimal((prev) => ({ ...prev, [name]: value }));

        // Xóa lỗi khi người dùng nhập
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // Xác thực form
        const { isValid, errors: validationErrors } = validateAnimalForm(animal);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            // Chuẩn bị dữ liệu cần thiết cho API theo đúng định dạng AnimalRequest
            const animalRequestData = {
                name: animal.name,
                entryDate: animal.entryDate,
                exitDate: animal.exitDate || null,
                status: animal.status,
                weight: parseFloat(animal.weight),
                penId: parseInt(animal.penId),
                quantity: parseInt(animal.quantity) // Thêm trường quantity vào dữ liệu gửi đi
            };

            // Để debug
            console.log("Gửi dữ liệu cập nhật:", animalRequestData);

            await animalService.updateAnimal(animal.pigId, animalRequestData);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi cập nhật động vật:", error);
            // Log chi tiết lỗi từ server
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            setServerError(error.response?.data?.error || "Không thể cập nhật. Vui lòng thử lại.");
            setLoading(false);
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
                CẬP NHẬT THÔNG TIN CON VẬT
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
                        {/* Hiển thị chuồng gốc (nếu không còn active) */}
                        {originalPenId &&
                            !pigPens.some(pen => pen.penId === originalPenId) && (
                                <MenuItem key={originalPenId} value={originalPenId}>
                                    {animalData.pigPen?.name || "Chuồng hiện tại"} (Giữ nguyên)
                                </MenuItem>
                            )}
                        {pigPens.map((pen) => (
                            <MenuItem key={pen.penId} value={pen.penId}>
                                {pen.name} ({pen.quantity} con)
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                </FormControl>

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
                        <MenuItem value="EXPORTED">Đã xuất</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>

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
                        inputProps: { min: 1 }
                    }}
                    fullWidth
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
                        {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                    </Button>
                </DialogActions>
            </Box>
        </Box>
    );
};

export default AnimalFormUpdate;