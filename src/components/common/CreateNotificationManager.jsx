import React, {useState, useEffect} from 'react';
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
    OutlinedInput
} from '@mui/material';
import {notificationService} from '../../services/NotificationService';
import {pigPenService} from '../../services/pigPenService';

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

const CreateNotificationForm = ({open, onClose, onCreated}) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Thêm state cho danh sách chuồng
    const [pigPens, setPigPens] = useState([]);
    const [selectedPigPens, setSelectedPigPens] = useState([]);

    // Fetch danh sách chuồng khi mở form
    useEffect(() => {
        if (open) {
            fetchPigPens();
        }
    }, [open]);

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
        const {value} = event.target;
        setSelectedPigPens(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Nội dung không được để trống');
            return;
        }

        setLoading(true);
        try {
            // Tạo đối tượng thông báo với danh sách chuồng
            const notificationData = {
                content,
                pigPens: selectedPigPens.map(penId => ({penId}))
            };

            await notificationService.add(notificationData);
            if (onCreated) onCreated();
            setContent('');
            setSelectedPigPens([]);
            onClose();
        } catch (err) {
            setError('Thêm thông báo thất bại');
            console.error("Lỗi khi thêm thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setContent('');
        setError('');
        setSelectedPigPens([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm mới thông báo</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mb: 2}}>
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
                        <InputLabel id="pigpens-label">Chuồng nuôi</InputLabel>
                        <Select
                            labelId="pigpens-label"
                            multiple
                            value={selectedPigPens}
                            onChange={handlePigPensChange}
                            input={<OutlinedInput label="Chuồng nuôi"/>}
                            renderValue={(selected) => (
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
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

                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                    >
                        {loading ? 'Đang xử lý...' : 'Thêm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateNotificationForm;