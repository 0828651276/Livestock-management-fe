import React, {useState, useEffect} from 'react';
import {TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Box, Alert} from '@mui/material';
import {fetchFeedInventory} from '../../services/feedWarehouseService';
import {pigPenService} from '../../services/pigPenService';
import {updateFeedPlan} from "../../services/feedPlanService";

const FeedPlanEditForm = ({onClose, onSuccess, initialData}) => {
    const [formData, setFormData] = useState({
        feedType: initialData.feedType,
        dailyFood: initialData.totalDailyFood,
        pigPenId: initialData.pigPenId,
    });

    const [pigPens, setPigPens] = useState([]);
    const [feedTypes, setFeedTypes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const id = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const role = localStorage.getItem('role');
                const employeeId = localStorage.getItem('employeeId');

                // Lấy danh sách chuồng nuôi
                let pens;
                if (role === 'MANAGER') {
                    pens = await pigPenService.getAllPigPens();
                } else {
                    pens = await pigPenService.findByEmployeeId(employeeId);
                }
                setPigPens(pens);

                // Lấy danh sách loại thức ăn
                const inventoryData = await fetchFeedInventory();
                const types = inventoryData.map(item => ({
                    id: item.id,
                    name: item.feedType
                }));
                setFeedTypes(types);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.feedType || !formData.dailyFood || !formData.pigPenId) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const data = {
                feedType: formData.feedType,
                dailyFood: parseInt(formData.dailyFood),
                pigPenId: formData.pigPenId
            };

            await updateFeedPlan(initialData.id, data);
            onSuccess();
            setError('');
        } catch (error) {
            console.error('Lỗi khi cập nhật khẩu phần:', error);
            setError('Không thể cập nhật khẩu phần. Vui lòng thử lại sau.');
        }
    };

    console.log('Initial data:', initialData);

    return (
        <Box maxWidth={600} mx="auto" padding={2}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} direction="column">
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Loại thức ăn</InputLabel>
                            <Select
                                name="feedType"
                                value={formData.feedType}
                                onChange={handleChange}
                                label="Loại thức ăn"
                                disabled={loading}
                            >
                                {feedTypes.map((feed) => (
                                    <MenuItem key={feed.id} value={feed.name}>
                                        {feed.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Số lượng (kg)"
                            name="dailyFood"
                            type="number"
                            fullWidth
                            value={formData.dailyFood}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Chuồng nuôi</InputLabel>
                            <Select
                                name="pigPenId"
                                value={formData.pigPenId}
                                onChange={handleChange}
                                label="Chuồng nuôi"
                                disabled={loading}
                            >
                                {pigPens.map((pen) => (
                                    <MenuItem key={pen.penId} value={pen.penId}>
                                        {pen.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                            <Button type="submit" fullWidth variant="contained" color="primary">
                                Cập nhật
                            </Button>
                            <Button fullWidth variant="outlined" onClick={onClose}>
                                Đóng
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default FeedPlanEditForm;