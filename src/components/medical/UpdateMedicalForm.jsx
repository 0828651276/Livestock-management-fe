import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    CircularProgress
} from "@mui/material";

const UpdateMedicalForm = ({ treatment, onSave, onCancel, animals, pens }) => {
    const [formData, setFormData] = useState({
        pigId: "",
        penId: "",
        date: new Date().toISOString().split('T')[0],
        treatmentType: "",
        veterinarian: "",
        medicine: "",
        note: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (treatment) {
            setFormData({
                pigId: treatment.pigId?.toString() || "",
                penId: treatment.penId?.toString() || "",
                date: treatment.date ? new Date(treatment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                treatmentType: treatment.treatmentType || "",
                veterinarian: treatment.veterinarian || "",
                medicine: treatment.medicine || "",
                note: treatment.note || ""
            });
        }
    }, [treatment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Update pen when animal is selected
        if (name === 'pigId') {
            const selectedAnimal = animals.find(a => a.pigId.toString() === value);
            if (selectedAnimal && selectedAnimal.pigPen) {
                setFormData(prev => ({ ...prev, penId: selectedAnimal.pigPen.penId.toString() }));
            }
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.pigId) newErrors.pigId = "Vui lòng chọn động vật";
        if (!formData.penId) newErrors.penId = "Vui lòng chọn chuồng";
        if (!formData.date) newErrors.date = "Vui lòng chọn ngày";
        if (!formData.treatmentType) newErrors.treatmentType = "Vui lòng nhập loại điều trị";
        if (!formData.veterinarian) newErrors.veterinarian = "Vui lòng nhập tên bác sĩ";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Khi cập nhật cần gửi kèm id nếu có
            await onSave({ ...formData, id: treatment?.id });
        } catch (error) {
            console.error("Error saving treatment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.pigId}>
                        <InputLabel id="animal-select-label">Động vật</InputLabel>
                        <Select
                            labelId="animal-select-label"
                            name="pigId"
                            value={formData.pigId}
                            onChange={handleChange}
                            label="Động vật"
                        >
                            <MenuItem value="">
                                <em>Chọn động vật</em>
                            </MenuItem>
                            {animals.map((animal) => (
                                <MenuItem key={animal.pigId} value={animal.pigId.toString()}>
                                    {animal.name} - {animal.status}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.pigId && <FormHelperText>{errors.pigId}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.penId}>
                        <InputLabel id="pen-select-label">Chuồng nuôi</InputLabel>
                        <Select
                            labelId="pen-select-label"
                            name="penId"
                            value={formData.penId}
                            onChange={handleChange}
                            label="Chuồng nuôi"
                        >
                            <MenuItem value="">
                                <em>Chọn chuồng</em>
                            </MenuItem>
                            {pens.map((pen) => (
                                <MenuItem key={pen.penId} value={pen.penId.toString()}>
                                    {pen.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.penId && <FormHelperText>{errors.penId}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Ngày điều trị"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.date}
                        helperText={errors.date}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Loại điều trị"
                        name="treatmentType"
                        value={formData.treatmentType}
                        onChange={handleChange}
                        error={!!errors.treatmentType}
                        helperText={errors.treatmentType}
                        placeholder="Ví dụ: Tiêm phòng, Điều trị bệnh tiêu chảy..."
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Bác sĩ/Nhân viên thú y"
                        name="veterinarian"
                        value={formData.veterinarian}
                        onChange={handleChange}
                        error={!!errors.veterinarian}
                        helperText={errors.veterinarian}
                        placeholder="Tên bác sĩ hoặc nhân viên thú y"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Thuốc"
                        name="medicine"
                        value={formData.medicine}
                        onChange={handleChange}
                        placeholder="Tên thuốc và liều lượng"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Ghi chú"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        placeholder="Mô tả triệu chứng, kết quả điều trị..."
                    />
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        HỦY
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        type="submit"
                        startIcon={<span className="material-icons">medical_services</span>}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : 'LƯU ĐIỀU TRỊ'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UpdateMedicalForm;
