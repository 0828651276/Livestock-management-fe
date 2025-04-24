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
    Alert
} from "@mui/material";
import { animalService } from "../../services/animalService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
            // Khởi tạo form data từ dữ liệu động vật
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

            // Lưu thông tin ban đầu để tính toán thay đổi
            setOriginalPenId(animal.pigPen?.penId || null);
            setOriginalQuantity(animal.quantity || 1);
        }
    }, [animal]);

    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = "Tên không được để trống";
        } else if (formData.name.length < 2 || formData.name.length > 100) {
            newErrors.name = "Tên phải từ 2 đến 100 ký tự";
        }

        // Validate entry date
        if (!formData.entryDate) {
            newErrors.entryDate = "Ngày nhập không được để trống";
        }

        // Validate exit date
        if (formData.exitDate && formData.entryDate && formData.exitDate < formData.entryDate) {
            newErrors.exitDate = "Ngày xuất phải sau ngày nhập";
        }

        // Validate weight
        if (!formData.weight) {
            newErrors.weight = "Cân nặng không được để trống";
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = "Cân nặng phải là số dương";
        } else if (Number(formData.weight) > 1000) {
            newErrors.weight = "Cân nặng không được vượt quá 1000kg";
        }

        // Validate quantity
        if (!formData.quantity) {
            newErrors.quantity = "Số lượng không được để trống";
        } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
            newErrors.quantity = "Số lượng phải là số dương";
        } else if (Number(formData.quantity) > 1000) {
            newErrors.quantity = "Số lượng không được vượt quá 1000";
        }

        // Validate penId
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
            // Nếu chuyển sang EXPORTED thì tự động đặt ngày xuất là hôm nay nếu chưa có
            exitDate: value === "EXPORTED" && !prev.exitDate ? new Date() : prev.exitDate,
            // Nếu chuyển sang EXPORTED thì xóa chuồng nuôi
            penId: value === "EXPORTED" ? "" : prev.penId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Chuẩn bị dữ liệu gửi đi
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

            // Gọi API để cập nhật animal
            await animalService.update(animal.pigId, payload);

            // Thêm một khoảng thời gian trễ nhỏ để đảm bảo backend đã xử lý xong
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
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
                {originalPenId === null && formData.raisingStatus === "RAISING" && (
                    <Grid item xs={12}>
                        <Alert severity="warning">
                            Động vật này trước đây không được gán vào chuồng nuôi. Nếu cập nhật trạng thái thành "Đang nuôi",
                            vui lòng chọn một chuồng nuôi.
                        </Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium" }}>
                        Thông tin cơ bản
                    </Typography>
                </Grid>

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
                    />
                </Grid>

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
                    />
                </Grid>

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
                                />
                            )}
                            maxDate={new Date()}
                        />
                    </LocalizationProvider>
                </Grid>

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
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
                        Trạng thái
                    </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
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
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Trạng thái nuôi</InputLabel>
                        <Select
                            name="raisingStatus"
                            value={formData.raisingStatus}
                            onChange={handleRaisingStatusChange}
                            label="Trạng thái nuôi"
                        >
                            <MenuItem value="RAISING">Đang nuôi</MenuItem>
                            <MenuItem value="EXPORTED">Đã xuất chuồng</MenuItem>
                        </Select>
                        <FormHelperText>
                            {formData.raisingStatus === "EXPORTED"
                                ? "Động vật đã xuất chuồng sẽ không gắn với chuồng nuôi nào"
                                : ""}
                        </FormHelperText>
                    </FormControl>
                </Grid>

                {formData.raisingStatus === "EXPORTED" && (
                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                            <DatePicker
                                label="Ngày xuất chuồng"
                                value={formData.exitDate}
                                onChange={(date) => handleDateChange("exitDate", date)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.exitDate}
                                        helperText={errors.exitDate || ""}
                                    />
                                )}
                                minDate={formData.entryDate}
                                maxDate={new Date()}
                            />
                        </LocalizationProvider>
                    </Grid>
                )}

                {formData.raisingStatus === "RAISING" && (
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required error={!!errors.penId}>
                            <InputLabel>Chuồng nuôi</InputLabel>
                            <Select
                                name="penId"
                                value={formData.penId}
                                onChange={handleInputChange}
                                label="Chuồng nuôi"
                            >
                                {pigPens && pigPens.length > 0 ? (
                                    pigPens.map((pen) => (
                                        <MenuItem key={pen.penId} value={pen.penId}>
                                            {pen.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>Không có chuồng nuôi</MenuItem>
                                )}
                            </Select>
                            {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                        </FormControl>
                    </Grid>
                )}

                {errors.submit && (
                    <Grid item xs={12}>
                        <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button onClick={onCancel} sx={{ mr: 2 }}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} />}
                        >
                            Cập nhật
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnimalFormUpdate;