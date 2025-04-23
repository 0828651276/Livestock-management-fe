import React, { useEffect, useState } from 'react';
import {
    TextField, Button, Grid, Select, MenuItem,
    InputLabel, FormControl, Box, Alert, Typography,
    CircularProgress, Paper
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchFeedInventory } from '../../services/feedWarehouseService';
import { pigPenService } from '../../services/pigPenService';
import { updateFeedPlan } from "../../services/feedPlanService";

const FeedPlanUpdatePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pigPenId = searchParams.get('pigPenId');
    const feedType = searchParams.get('feedType');

    const [formData, setFormData] = useState({
        id: '',
        feedType: '',
        dailyFood: '',
        pigPenId: ''
    });

    const [pigPens, setPigPens] = useState([]);
    const [feedTypes, setFeedTypes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');

                // Set initial form data from query parameters
                setFormData(prev => ({
                    ...prev,
                    feedType: feedType || '',
                    pigPenId: pigPenId || ''
                }));

                const role = localStorage.getItem('role');
                const employeeId = localStorage.getItem('employeeId');
                const pens = role === 'MANAGER'
                    ? await pigPenService.getAllPigPens()
                    : await pigPenService.findByEmployeeId(employeeId);
                setPigPens(pens);

                const inventoryData = await fetchFeedInventory();
                const types = inventoryData.map(item => ({
                    id: item.id,
                    name: item.feedType
                }));
                setFeedTypes(types);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pigPenId, feedType]);

    const validateForm = () => {
        const errors = {};
        if (!formData.feedType) errors.feedType = 'Vui lòng chọn loại thức ăn';
        if (!formData.dailyFood) errors.dailyFood = 'Vui lòng nhập số lượng';
        if (formData.dailyFood && (isNaN(formData.dailyFood) || formData.dailyFood <= 0)) {
            errors.dailyFood = 'Số lượng phải lớn hơn 0';
        }
        if (!formData.pigPenId) errors.pigPenId = 'Vui lòng chọn chuồng nuôi';
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setSubmitting(true);
            const data = {
                feedType: formData.feedType,
                dailyFood: parseInt(formData.dailyFood),
                pigPenId: formData.pigPenId
            };

            await updateFeedPlan(pigPenId, data);
            setSuccess('Cập nhật khẩu phần thành công!');
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            console.error('Lỗi khi cập nhật khẩu phần:', error);
            setError('Không thể cập nhật khẩu phần. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box maxWidth="sm" mx="auto" padding={3}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Cập nhật khẩu phần ăn
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <FormControl fullWidth error={!!formErrors.feedType}>
                                <InputLabel>Loại thức ăn</InputLabel>
                                <Select
                                    name="feedType"
                                    value={formData.feedType}
                                    onChange={handleChange}
                                    label="Loại thức ăn"
                                    disabled={loading || submitting}
                                >
                                    {feedTypes.map(feed => (
                                        <MenuItem key={feed.id} value={feed.name}>
                                            {feed.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.feedType && (
                                    <Typography variant="caption" color="error">
                                        {formErrors.feedType}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item>
                            <TextField
                                label="Số lượng (kg)"
                                name="dailyFood"
                                type="number"
                                fullWidth
                                value={formData.dailyFood}
                                onChange={handleChange}
                                error={!!formErrors.dailyFood}
                                helperText={formErrors.dailyFood}
                                disabled={loading || submitting}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item>
                            <FormControl fullWidth error={!!formErrors.pigPenId}>
                                <InputLabel>Chuồng nuôi</InputLabel>
                                <Select
                                    name="pigPenId"
                                    value={formData.pigPenId}
                                    onChange={handleChange}
                                    label="Chuồng nuôi"
                                    disabled={loading || submitting}
                                >
                                    {pigPens.map(pen => (
                                        <MenuItem key={pen.penId} value={pen.penId}>
                                            {pen.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.pigPenId && (
                                    <Typography variant="caption" color="error">
                                        {formErrors.pigPenId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading || submitting}
                                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                                >
                                    {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default FeedPlanUpdatePage;
