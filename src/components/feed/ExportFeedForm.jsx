import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Box, Alert } from '@mui/material';
import { exportFeed, fetchFeedInventory } from '../../services/feedWarehouseService';
import { pigPenService } from '../../services/pigPenService';

const ExportFeedForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        feedName: '',  // feedName sẽ lưu tên thức ăn
        quantity: '',
        date: new Date().toISOString().split('T')[0], // Set default to today's date
        pigPenId: '',
        note: ''
    });

    const [pigPens, setPigPens] = useState([]);
    const [feedTypes, setFeedTypes] = useState([]);  // Mảng chứa danh sách loại thức ăn
    const [inventory, setInventory] = useState([]); // Thêm state để lưu thông tin tồn kho
    const [error, setError] = useState(''); // Thêm state để lưu thông báo lỗi
    const [loading, setLoading] = useState(true); // Thêm state loading
    const [userRole, setUserRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    // Fetch dữ liệu khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Lấy vai trò và ID nhân viên
                const role = localStorage.getItem('role');
                const id = localStorage.getItem('employeeId');
                setUserRole(role);
                setEmployeeId(id);

                // Lấy danh sách chuồng nuôi kèm tên vật nuôi (giống feedlan)
                const pens = await pigPenService.fetchPigPensWithAnimal();
                setPigPens(pens);

                // Lấy danh sách loại thức ăn từ kho
                const inventoryData = await fetchFeedInventory();
                setInventory(inventoryData);

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

    // Hàm kiểm tra số lượng
    const checkQuantity = (quantity) => {
        if (!formData.feedName || !quantity) return;

        const selectedFeed = inventory.find(item => item.feedType === formData.feedName);
        if (selectedFeed) {
            if (parseInt(quantity) > selectedFeed.remainingQuantity) {
                setError(`Số lượng vượt quá tồn kho. Số lượng còn lại: ${selectedFeed.remainingQuantity} kg`);
            } else {
                setError('');
            }
        }
    };

    // Hàm xử lý thay đổi trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Kiểm tra số lượng khi người dùng nhập
        if (name === 'quantity') {
            checkQuantity(value);
        }
    };

    // Hàm xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra lại số lượng trước khi submit
        const selectedFeed = inventory.find(item => item.feedType === formData.feedName);
        if (selectedFeed && parseInt(formData.quantity) > selectedFeed.remainingQuantity) {
            setError(`Số lượng vượt quá tồn kho. Số lượng còn lại: ${selectedFeed.remainingQuantity} kg`);
            return;
        }

        try {
            const data = {
                ...formData,
                quantity: parseInt(formData.quantity)  // Chuyển đổi quantity thành số
            };
            await exportFeed(data);  // Gửi yêu cầu xuất kho
            onSuccess();
            setFormData({
                feedName: '',  // Reset feedName sau khi xuất kho
                quantity: '',
                transactionDate: '',
                pigPenId: '',
                note: ''
            });
            setError('');
        } catch (error) {
            alert('Lỗi khi xuất kho!');
            console.error(error);  // In lỗi ra console để dễ debug
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
                            <InputLabel>Loại thức ăn</InputLabel>
                            <Select
                                name="feedType"
                                value={formData.feedType}
                                onChange={handleChange}
                                label="Chọn thức ăn"
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
                            name="quantity"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Ngày xuất kho"
                            name="date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.date}
                            onChange={handleChange}
                            required
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
                                        {pen.penName} - {pen.animalNames}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Ghi chú"
                            name="note"
                            type="text"
                            fullWidth
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                            <Button type="submit" fullWidth variant="contained" color="secondary">
                                Xuất kho
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

export default ExportFeedForm;
