import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    CircularProgress,
    Typography,
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

const AnimalFormUpdate = ({ animal, pigPens, onSuccess, onCancel }) => {
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

    const [originalPenId, setOriginalPenId] = useState(null);
    const [originalQuantity, setOriginalQuantity] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
            setOriginalPenId(animal.pigPen?.penId || null);
            setOriginalQuantity(animal.quantity || 1);
        }
    }, [animal]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên không được để trống";
        } else if (formData.name.length < 2 || formData.name.length > 100) {
            newErrors.name = "Tên phải từ 2 đến 100 ký tự";
        }

        if (!formData.entryDate) {
            newErrors.entryDate = "Ngày nhập không được để trống";
        }

        if (formData.exitDate && formData.entryDate && formData.exitDate < formData.entryDate) {
            newErrors.exitDate = "Ngày xuất phải sau ngày nhập";
        }

        if (!formData.weight) {
            newErrors.weight = "Cân nặng không được để trống";
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = "Cân nặng phải là số dương";
        } else if (Number(formData.weight) > 1000) {
            newErrors.weight = "Cân nặng không được vượt quá 1000kg";
        }

        if (!formData.quantity) {
            newErrors.quantity = "Số lượng không được để trống";
        } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
            newErrors.quantity = "Số lượng phải là số dương";
        } else if (Number(formData.quantity) > 1000) {
            newErrors.quantity = "Số lượng không được vượt quá 1000";
        }

        if (formData.raisingStatus === "RAISING" && !formData.penId) {
            newErrors.penId = "Vui lòng chọn chuồng nuôi cho động vật đang nuôi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, date) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleRaisingStatusChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            raisingStatus: value,
            exitDate: value === "EXPORTED" && !prev.exitDate ? new Date() : prev.exitDate,
            penId: value === "EXPORTED" ? "" : prev.penId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
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

            await animalService.update(animal.pigId, payload);
            setTimeout(() => onSuccess(), 300);
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
                    {originalPenId === null && formData.raisingStatus === "RAISING" && (
                        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 1, mb: 3 }}>
                            Vật nuôi này trước đây không được gán vào chuồng nuôi. Nếu cập nhật trạng thái thành "Đang nuôi", vui lòng chọn một chuồng nuôi.
                        </Alert>
                    )}

                    <FormControl fullWidth margin="normal">
                        <TextField
                            label="Tên vật nuôi"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={!!errors.name}
                            helperText={errors.name || ""}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <TextField
                            label="Cân nặng (kg)"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleInputChange}
                            error={!!errors.weight}
                            helperText={errors.weight || ""}
                            InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                            required
                        />
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <FormControl sx={{ flex: 1 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                                <DatePicker
                                    label="Ngày nhập"
                                    value={formData.entryDate}
                                    onChange={(date) => handleDateChange("entryDate", date)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={!!errors.entryDate}
                                            helperText={errors.entryDate || ""}
                                            required
                                        />
                                    )}
                                    maxDate={new Date()}
                                />
                            </LocalizationProvider>
                        </FormControl>

                        <FormControl sx={{ flex: 1 }}>
                            <TextField
                                label="Số lượng"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                error={!!errors.quantity}
                                helperText={errors.quantity || ""}
                                required
                            />
                        </FormControl>
                    </Box>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái sức khỏe</InputLabel>
                        <Select
                            name="healthStatus"
                            value={formData.healthStatus}
                            onChange={handleInputChange}
                            label="Trạng thái sức khỏe"
                        >
                            <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                            <MenuItem value="SICK">Bị bệnh</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái nuôi</InputLabel>
                        <Select
                            name="raisingStatus"
                            value={formData.raisingStatus}
                            onChange={handleRaisingStatusChange}
                            label="Trạng thái nuôi"
                        >
                            <MenuItem value="RAISING">Đang nuôi</MenuItem>
                            <MenuItem value="EXPORTED">Đã xuất</MenuItem>
                        </Select>
                    </FormControl>

                    {formData.raisingStatus === "EXPORTED" && (
                        <FormControl fullWidth margin="normal">
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                                <DatePicker
                                    label="Ngày xuất"
                                    value={formData.exitDate}
                                    onChange={(date) => handleDateChange("exitDate", date)}
                                    renderInput={(params) => (
                                        <TextField {...params} error={!!errors.exitDate} helperText={errors.exitDate || ""} required />
                                    )}
                                    minDate={formData.entryDate}
                                    maxDate={new Date()}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    )}

                    {formData.raisingStatus === "RAISING" && (
                        <FormControl fullWidth margin="normal" error={!!errors.penId}>
                            <InputLabel>Chuồng nuôi</InputLabel>
                            <Select
                                name="penId"
                                value={formData.penId}
                                onChange={handleInputChange}
                                label="Chuồng nuôi"
                            >
                                {pigPens?.filter(p => p.status === "ACTIVE").map(pen => (
                                    <MenuItem key={pen.penId} value={pen.penId}>{pen.name}</MenuItem>
                                )) || <MenuItem disabled>Không có chuồng nuôi</MenuItem>}
                            </Select>
                            {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                        </FormControl>
                    )}

                    {errors.submit && (
                        <Alert severity="error" sx={{ mt: 2 }}>{errors.submit}</Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Button variant="outlined" onClick={onCancel} disabled={loading}>Hủy</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AnimalFormUpdate;
