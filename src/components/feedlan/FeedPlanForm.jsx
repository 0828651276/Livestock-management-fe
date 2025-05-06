import React, {useState, useEffect} from 'react';
import {TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Box, Alert} from '@mui/material';
import {fetchFeedInventory} from '../../services/feedWarehouseService';
import {pigPenService} from '../../services/pigPenService';
import {createFeedPlan} from "../../services/feedPlanService";

const FeedPlanForm = ({onClose, onSuccess}) => {
    const [formData, setFormData] = useState({
        feedType: '',
        dailyFood: '',
        pigPenId: '',
    });

    const [pigPens, setPigPens] = useState([]);
    const [feedTypes, setFeedTypes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Lấy danh sách chuồng nuôi kèm tên động vật (chỉ dùng API mới)
                const pens = await pigPenService.fetchPigPensWithAnimal();
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
                ...formData,
                dailyFood: parseInt(formData.dailyFood)
            };

            await createFeedPlan(data);
            onSuccess();
            setFormData({
                feedType: '',
                dailyFood: '',
                pigPenId: '',
            });
            setError('');
        } catch (error) {
            console.error('Lỗi khi tạo khẩu phần:', error);
            setError('Không thể tạo khẩu phần. Vui lòng thử lại sau.');
        }
    };

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
                                        {pen.penName} - {pen.animalNames}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

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
                        <Box display="flex" gap={2}>
                            <Button type="submit" fullWidth variant="contained" color="primary">
                                Tạo khẩu phần
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

export default FeedPlanForm;
