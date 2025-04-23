import React, {useState, useEffect} from 'react';
import {TextField, Button, Grid, Box} from '@mui/material';
import {importFeed} from '../../services/feedWarehouseService';

const ImportFeedForm = ({onClose, onSuccess}) => {
    const [formData, setFormData] = useState({
        feedType: '',
        quantity: '',
        date: '',
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({...prev, date: today}));
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                quantity: parseInt(formData.quantity)
            };
            await importFeed(data);
            onSuccess();
            setFormData({feedType: '', quantity: '', date: ''});
        } catch (error) {
            alert('Lỗi khi nhập kho!');
        }
    };

    return (
        <Box maxWidth={600} mx="auto">
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} direction="column">
                    <Grid item xs={12}>
                        <TextField
                            label="Tên thức ăn"
                            name="feedType"
                            fullWidth
                            value={formData.feedType}
                            onChange={handleChange}
                            required
                        />
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
                            label="Ngày nhập"
                            name="date"
                            type="date"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                            <Button type="submit" fullWidth variant="contained" color="primary">
                                Nhập kho
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

export default ImportFeedForm;
