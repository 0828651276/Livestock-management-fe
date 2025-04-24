import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Typography
} from '@mui/material';
import { notificationService } from '../../services/NotificationService';
import { pigPenService } from '../../services/pigPenService';

// Cấu hình cho dropdown multi-select
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const UpdateNotificationForm = ({ open, onClose, notification, onUpdated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Thêm state cho danh sách chuồng
    const [pigPens, setPigPens] = useState([]);
    const [selectedPigPens, setSelectedPigPens] = useState([]);

    useEffect(() => {
        // Reset form khi mở lại
        if (open && notification) {
            setContent(notification.content || '');
            fetchPigPens();

            // Nếu notification có danh sách pigPens
            if (notification.pigPens && Array.isArray(notification.pigPens)) {
                const penIds = notification.pigPens.map(pen => pen.penId);
                setSelectedPigPens(penIds);
            } else {
                setSelectedPigPens([]);
            }
        }
        setError('');
    }, [notification, open]);

    const fetchPigPens = async () => {
        try {
            const pens = await pigPenService.getAllPigPens();
            // Chỉ lấy các chuồng đang hoạt động
            const activePens = pens.filter(pen => pen.status === 'ACTIVE');
            setPigPens(activePens);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chuồng:", err);
            setError("Không thể tải danh sách chuồng nuôi");
        }
    };

    const handlePigPensChange = (event) => {
        const { value } = event.target;
        setSelectedPigPens(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Nội dung không được để trống');
            return;
        }

        if (selectedPigPens.length === 0) {
            setError('Vui lòng chọn ít nhất một chuồng nuôi');
            return;
        }

        setLoading(true);
        try {
            // Chuẩn bị đối tượng thông báo cập nhật
            const updatedNotification = {
                ...notification,
                content,
                // Đặt trạng thái read về false
                read: false,
                pigPens: selectedPigPens.map(penId => ({ penId }))
            };

            await notificationService.update(notification.id, updatedNotification);
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            setError('Cập nhật thông báo thất bại');
            console.error("Lỗi khi cập nhật thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cập nhật thông báo</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                        <TextField
                            label="Nội dung thông báo"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            required
                        />

                        {/* Dropdown chọn chuồng nuôi */}
                        <FormControl fullWidth required>
                            <InputLabel id="pigpens-update-label">Chuồng nuôi</InputLabel>
                            <Select
                                labelId="pigpens-update-label"
                                multiple
                                value={selectedPigPens}
                                onChange={handlePigPensChange}
                                input={<OutlinedInput label="Chuồng nuôi" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const pen = pigPens.find(p => p.penId === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={pen ? pen.name : value}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {pigPens.map((pen) => (
                                    <MenuItem key={pen.penId} value={pen.penId}>
                                        {pen.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Thông báo về việc reset trạng thái đã đọc */}
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            * Lưu ý: Cập nhật thông báo sẽ reset trạng thái đã đọc và tất cả nhân viên sẽ nhận được thông báo lại.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !content.trim() || selectedPigPens.length === 0}
                    >
                        {loading ? 'Đang xử lý...' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdateNotificationForm;