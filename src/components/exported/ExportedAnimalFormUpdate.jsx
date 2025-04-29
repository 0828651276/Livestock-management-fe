import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    DialogActions,
    Typography,
    Alert,
    InputAdornment,
    MenuItem
} from "@mui/material";
import { animalService } from "../../services/animalService";
import "../styles/FormValidation.css";
import { validateAnimalForm } from "../../utils/validateUtils";

const initialState = {
    name: "",
    entryDate: "",
    exitDate: "",
    healthStatus: "ACTIVE",
    raisingStatus: "EXPORTED",
    weight: "",
    quantity: 1
};

const ExportedAnimalFormUpdate = ({ onClose, animalData }) => {
    const [animal, setAnimal] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    useEffect(() => {
        if (animalData) {
            // Format dates and statuses for form inputs
            const formattedAnimal = {
                ...animalData,
                entryDate: animalData.entryDate ? new Date(animalData.entryDate).toISOString().split('T')[0] : "",
                exitDate: animalData.exitDate ? new Date(animalData.exitDate).toISOString().split('T')[0] : "",
                healthStatus: animalData.healthStatus || "ACTIVE",
                raisingStatus: animalData.raisingStatus || "EXPORTED",
                weight: animalData.weight?.toString() || "",
                quantity: animalData.quantity || 1
            };
            setAnimal(formattedAnimal);
        }
    }, [animalData]);

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
            // Prepare data for API
            const animalRequestData = {
                name: animal.name,
                entryDate: animal.entryDate,
                exitDate: animal.exitDate || null,
                healthStatus: animal.healthStatus,
                raisingStatus: animal.raisingStatus,
                weight: parseFloat(animal.weight),
                penId: null,
                quantity: parseInt(animal.quantity)
            };

            await animalService.update(animal.pigId, animalRequestData);
            onClose(true);
        } catch (error) {
            console.error("Lỗi khi cập nhật động vật:", error);
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
                CẬP NHẬT THÔNG TIN CÁ THỂ ĐÃ XUẤT
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

                {/* Ngày nhập */}
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

                {/* Ngày xuất */}
                <TextField
                    label="Ngày xuất"
                    name="exitDate"
                    type="date"
                    value={animal.exitDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.exitDate}
                    helperText={errors.exitDate}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.exitDate ? "field-error" : ""}
                    fullWidth
                />

                {/* Trạng thái sức khỏe */}
                <TextField
                    select
                    label="Trạng thái sức khỏe"
                    name="healthStatus"
                    value={animal.healthStatus}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.healthStatus}
                    helperText={errors.healthStatus}
                    sx={{ "& .MuiInputBase-input": { py: 1.5 } }}
                    className={errors.healthStatus ? "field-error" : ""}
                >
                    <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                    <MenuItem value="SICK">Bị bệnh</MenuItem>
                </TextField>

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

export default ExportedAnimalFormUpdate;