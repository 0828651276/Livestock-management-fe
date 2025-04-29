import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box
} from '@mui/material';
import { vaccinationService } from '../../services/VaccinationService';

/**
 * Component for updating vaccination records
 */
const UpdateVaccinationForm = ({ open, vaccination, onSuccess, onCancel }) => {
    const [form, setForm] = useState({
        date: '',
        vaccine: '',
        note: '',
        status: 'SCHEDULED'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vaccination && open) {
            setForm({
                date: vaccination.date || '',
                vaccine: vaccination.vaccine || '',
                note: vaccination.note || '',
                status: vaccination.status || 'SCHEDULED'
            });
        }
    }, [vaccination, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!vaccination || !vaccination.id) return;
        setLoading(true);
        try {
            await vaccinationService.updateMedical(vaccination.id, {
                animal: { pigId: vaccination.animal.pigId },
                date: form.date,
                vaccine: form.vaccine,
                note: form.note,
                status: form.status
            });
            onSuccess();
        } catch (err) {
            console.error('Error updating vaccination record:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>
                Cập nhật tiêm phòng
                {vaccination?.animal && ` - ${vaccination.animal.name}`}
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Ngày tiêm phòng"
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="Loại vắc xin"
                        name="vaccine"
                        value={form.vaccine}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Ghi chú"
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Hủy</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Lưu'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateVaccinationForm; 