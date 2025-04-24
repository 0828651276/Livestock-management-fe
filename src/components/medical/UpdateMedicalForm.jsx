import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Box
} from '@mui/material';
import { medicalService } from '../../services/medicalService';

/**
 * Component for updating medical treatment records
 */
const UpdateMedicalForm = ({ open, medical, animals, onSuccess, onCancel }) => {
    const [form, setForm] = useState({
        treatmentDate: '',
        treatmentMethod: 'INJECTION',
        veterinarian: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (medical && open) {
            setForm({
                treatmentDate: medical.treatmentDate || '',
                treatmentMethod: medical.treatmentMethod || 'INJECTION',
                veterinarian: medical.veterinarian || '',
                notes: medical.notes || ''
            });
        }
    }, [medical, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!medical || !medical.id) return;

        setLoading(true);
        try {
            await medicalService.updateMedical(medical.id, {
                animal: { pigId: medical.animal.pigId },
                treatmentDate: form.treatmentDate,
                treatmentMethod: form.treatmentMethod,
                veterinarian: form.veterinarian,
                notes: form.notes
            });

            onSuccess();
        } catch (err) {
            console.error('Error updating medical record:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>
                Cập nhật điều trị
                {medical?.animal && ` - ${medical.animal.name}`}
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Ngày điều trị"
                        type="date"
                        name="treatmentDate"
                        value={form.treatmentDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Phương pháp"
                        name="treatmentMethod"
                        value={form.treatmentMethod}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="INJECTION">Tiêm</MenuItem>
                        <MenuItem value="ORAL">Cho uống</MenuItem>
                    </TextField>
                    <TextField
                        label="Thú y"
                        name="veterinarian"
                        value={form.veterinarian}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Ghi chú"
                        name="notes"
                        value={form.notes}
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

export default UpdateMedicalForm;