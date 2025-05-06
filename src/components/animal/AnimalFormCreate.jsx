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
    Paper,
    Card,
    CardContent
} from "@mui/material";
import { animalService } from "../../services/animalService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import viLocale from "date-fns/locale/vi";

const initialFormState = {
    name: "",
    entryDate: new Date(),
    exitDate: null,
    healthStatus: "ACTIVE",
    raisingStatus: "RAISING",
    weight: "",
    penId: "",
    quantity: 1
};

const AnimalFormCreate = ({ pigPens, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [pensWithAnimals, setPensWithAnimals] = useState([]);

    // Fetch pens that already have animals
    useEffect(() => {
        const fetchPensWithAnimals = async () => {
            try {
                const allAnimals = await animalService.getAll();
                const activePensWithAnimals = allAnimals
                    .filter(animal => animal.raisingStatus === "RAISING" && animal.pigPen)
                    .map(animal => animal.pigPen.penId);
                setPensWithAnimals(activePensWithAnimals);
            } catch (error) {
                console.error("Error fetching animals:", error);
            }
        };

        fetchPensWithAnimals();
    }, []);

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

        if (!validateForm()) {
            return;
        }

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

            await animalService.create(payload);

            setTimeout(() => {
                onSuccess();
            }, 300);
        } catch (error) {
            console.error("Lỗi khi tạo động vật:", error);
            setErrors((prev) => ({
                ...prev,
                submit: "Có lỗi xảy ra khi tạo động vật. Vui lòng thử lại!"
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
            <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom component="div" sx={{
                        borderBottom: '1px solid #e0e0e0',
                        pb: 2,
                        mb: 3,
                        display: 'none'
                    }}>
                        Thêm động vật mới
                    </Typography>

                    <Grid container direction="column" spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Tên vật nuôi"
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

                        <Grid item xs={12}>
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

                        <Grid container direction="row" spacing={3}>
                            <Grid item xs={6}>
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

                            <Grid item xs={6}>
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
                        </Grid>

                        <Grid item xs={12}>
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

                        {formData.raisingStatus === "EXPORTED" && (
                            <Grid item xs={12}>
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

                        {formData.raisingStatus === "RAISING" && (
                            <Grid item xs={12}>
                                <FormControl fullWidth required error={!!errors.penId} sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1
                                    }
                                }}>
                                    <InputLabel>Chuồng nuôi</InputLabel>
                                    <Select
                                        name="penId"
                                        value={formData.penId}
                                        onChange={handleInputChange}
                                        label="Chuồng nuôi"
                                        size="medium"
                                    >
                                        {pigPens && pigPens.length > 0 ? (
                                            pigPens
                                                .filter(pen => pen && pen.status === "ACTIVE" && !pensWithAnimals.includes(pen.penId))
                                                .map((pen) => (
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
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                borderTop: '1px solid #e0e0e0',
                pt: 1
            }}>
                <Button variant="contained" color="secondary" sx={{ mr: 2 }} onClick={onCancel}>Hủy</Button>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Lưu"}
                </Button>
            </Box>
        </Box>
    );
};

export default AnimalFormCreate;
