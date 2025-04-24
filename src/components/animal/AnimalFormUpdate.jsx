import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    CircularProgress,
    Typography,
    Divider,
    InputAdornment,
    Alert,
    Card,
    CardContent
} from "@mui/material";
import { animalService } from "../../services/animalService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import viLocale from "date-fns/locale/vi";

/**
 * Form component for updating existing animals
 */
const AnimalFormUpdate = ({ animal, pigPens, onSuccess, onCancel }) => {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        entryDate: new Date(),
        exitDate: null,
        healthStatus: "ACTIVE",
        raisingStatus: "RAISING",
        weight: "",
        penId: "",
        quantity: 1
    });

    // Track original values for comparison
    const [originalPenId, setOriginalPenId] = useState(null);
    const [originalQuantity, setOriginalQuantity] = useState(1);

    // Form state
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form with animal data when available
    useEffect(() => {
        if (animal) {
            setFormData({
                name: animal.name || "",
                entryDate: animal.entryDate ? new Date(animal.entryDate) : new Date(),
                exitDate: animal.exitDate ? new Date(animal.exitDate) : null,
                healthStatus: animal.healthStatus || "ACTIVE",
                raisingStatus: animal.raisingStatus || "RAISING",
                weight: animal.weight?.toString() || "",
                penId: animal.pigPen?.penId || "",
                quantity: animal.quantity || 1
            });

            // Store original values for comparison during updates
            setOriginalPenId(animal.pigPen?.penId || null);
            setOriginalQuantity(animal.quantity || 1);
        }
    }, [animal]);

    /**
     * Validates the form data
     * @returns {boolean} true if form is valid
     */
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Tên không được để trống";
        } else if (formData.name.length < 2 || formData.name.length > 100) {
            newErrors.name = "Tên phải từ 2 đến 100 ký tự";
        }

        // Entry date validation
        if (!formData.entryDate) {
            newErrors.entryDate = "Ngày nhập không được để trống";
        }

        // Exit date validation (if exists)
        if (formData.exitDate && formData.entryDate && formData.exitDate < formData.entryDate) {
            newErrors.exitDate = "Ngày xuất phải sau ngày nhập";
        }

        // Weight validation
        if (!formData.weight) {
            newErrors.weight = "Cân nặng không được để trống";
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = "Cân nặng phải là số dương";
        } else if (Number(formData.weight) > 1000) {
            newErrors.weight = "Cân nặng không được vượt quá 1000kg";
        }

        // Quantity validation
        if (!formData.quantity) {
            newErrors.quantity = "Số lượng không được để trống";
        } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
            newErrors.quantity = "Số lượng phải là số dương";
        } else if (Number(formData.quantity) > 1000) {
            newErrors.quantity = "Số lượng không được vượt quá 1000";
        }

        // PenId validation for RAISING status only
        if (formData.raisingStatus === "RAISING" && !formData.penId) {
            newErrors.penId = "Vui lòng chọn chuồng nuôi cho động vật đang nuôi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle standard input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle date picker changes
    const handleDateChange = (name, date) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    // Handle raising status changes with special logic
    const handleRaisingStatusChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            raisingStatus: value,
            // Auto-set exit date to today if status is EXPORTED and no date is set
            exitDate: value === "EXPORTED" && !prev.exitDate ? new Date() : prev.exitDate,
            // Clear pen ID if status is EXPORTED
            penId: value === "EXPORTED" ? "" : prev.penId
        }));
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                name: formData.name,
                entryDate: formData.entryDate.toISOString().split('T')[0],
                exitDate: formData.exitDate ? formData.exitDate.toISOString().split('T')[0] : null,
                healthStatus: formData.healthStatus,
                raisingStatus: formData.raisingStatus,
                weight: formData.weight,
                penId: formData.raisingStatus === "EXPORTED" ? null : formData.penId,
                quantity: formData.quantity
            };

            // Update animal data via service
            await animalService.update(animal.pigId, payload);

            // Small delay to ensure backend has processed
            setTimeout(() => {
                onSuccess();
            }, 300);
        } catch (error) {
            console.error("Lỗi khi cập nhật động vật:", error);
            setErrors((prev) => ({
                ...prev,
                submit: "Có lỗi xảy ra khi cập nhật động vật. Vui lòng thử lại!"
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2 }}>
            <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                    {/* Form Title */}
                    <Typography variant="h6" gutterBottom component="div" sx={{
                        borderBottom: '1px solid #e0e0e0',
                        pb: 2,
                        mb: 3,
                        display: 'none'  // Ẩn tiêu đề này đi
                    }}>
                        Cập nhật thông tin động vật
                    </Typography>

                    {/* Warning for animals without pen assignment */}
                    {originalPenId === null && formData.raisingStatus === "RAISING" && (
                        <Alert
                            severity="warning"
                            variant="outlined"
                            sx={{
                                borderRadius: 1,
                                mb: 3,
                                '& .MuiAlert-icon': {
                                    color: '#f57c00'
                                }
                            }}
                        >
                            Động vật này trước đây không được gán vào chuồng nuôi. Nếu cập nhật trạng thái thành "Đang nuôi",
                            vui lòng chọn một chuồng nuôi.
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Left Column - Labels/Categories */}
                        <Grid item xs={12} md={3}>
                            {/* Basic Information Section */}
                            <Typography variant="subtitle1" gutterBottom sx={{
                                fontWeight: 600,
                                color: '#333',
                                backgroundColor: '#f5f5f5',
                                p: 1,
                                borderRadius: 1,
                                mb: 3
                            }}>
                                Thông tin cơ bản
                            </Typography>
                        </Grid>

                        {/* Right Column - Input Fields */}
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={3}>
                                {/* Name Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Tên động vật"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={!!errors.name}
                                        helperText={errors.name || ""}
                                        size="medium"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Weight Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Cân nặng (kg)"
                                        name="weight"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        error={!!errors.weight}
                                        helperText={errors.weight || ""}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                        }}
                                        size="medium"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Entry Date Field */}
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                                        <DatePicker
                                            label="Ngày nhập *"
                                            value={formData.entryDate}
                                            onChange={(date) => handleDateChange("entryDate", date)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    required
                                                    error={!!errors.entryDate}
                                                    helperText={errors.entryDate || ""}
                                                    size="medium"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                            maxDate={new Date()}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                {/* Quantity Field */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Số lượng"
                                        name="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        error={!!errors.quantity}
                                        helperText={errors.quantity || ""}
                                        InputProps={{
                                            inputProps: { min: 1 }
                                        }}
                                        size="medium"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Health Status Field */}
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}>
                                        <InputLabel>Trạng thái sức khỏe</InputLabel>
                                        <Select
                                            name="healthStatus"
                                            value={formData.healthStatus}
                                            onChange={handleInputChange}
                                            label="Trạng thái sức khỏe"
                                            size="medium"
                                        >
                                            <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                                            <MenuItem value="SICK">Bị bệnh</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Raising Status Field */}
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}>
                                        <InputLabel>Trạng thái nuôi</InputLabel>
                                        <Select
                                            name="raisingStatus"
                                            value={formData.raisingStatus}
                                            onChange={handleRaisingStatusChange}
                                            label="Trạng thái nuôi"
                                            size="medium"
                                        >
                                            <MenuItem value="RAISING">Đang nuôi</MenuItem>
                                            <MenuItem value="EXPORTED">Đã xuất</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Exit Date Field - Only visible for EXPORTED status */}
                                {formData.raisingStatus === "EXPORTED" && (
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                                            <DatePicker
                                                label="Ngày xuất *"
                                                value={formData.exitDate}
                                                onChange={(date) => handleDateChange("exitDate", date)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        required
                                                        error={!!errors.exitDate}
                                                        helperText={errors.exitDate || ""}
                                                        size="medium"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1
                                                            }
                                                        }}
                                                    />
                                                )}
                                                minDate={formData.entryDate}
                                                maxDate={new Date()}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                )}

                                {/* Pen Selection - Only visible for RAISING status */}
                                {formData.raisingStatus === "RAISING" && (
                                    <Grid item xs={12} md={6}>
                                        <FormControl
                                            fullWidth
                                            required
                                            error={!!errors.penId}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1
                                                }
                                            }}
                                        >
                                            <InputLabel>Chuồng nuôi</InputLabel>
                                            <Select
                                                name="penId"
                                                value={formData.penId}
                                                onChange={handleInputChange}
                                                label="Chuồng nuôi"
                                                size="medium"
                                            >
                                                {pigPens?.map((pen) => (
                                                    <MenuItem key={pen.penId} value={pen.penId}>
                                                        {pen.name} - {pen.status === "EMPTY" ? "Trống" : "Đang sử dụng"}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                                        </FormControl>
                                    </Grid>
                                )}

                                {/* General submission error message */}
                                {errors.submit && (
                                    <Grid item xs={12}>
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {errors.submit}
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                    sx={{
                        borderRadius: 1,
                        minWidth: 100
                    }}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{
                        borderRadius: 1,
                        minWidth: 100
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                </Button>
            </Box>
        </Box>
    );
};

export default AnimalFormUpdate;