import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import viLocale from 'date-fns/locale/vi';
import { pigPenService } from '../../services/pigPenService';
import { updateVaccination } from '../../services/VaccinationService';

const VaccinationUpdateForm = ({ open, vaccination, onSuccess, onCancel }) => {
    const [form, setForm] = useState({
        date: null,
        vaccineType: '',
        note: '',
        pen: { id: '' }
    });
    const [loading, setLoading] = useState(false);
    const [pigPens, setPigPens] = useState([]);

    useEffect(() => {
        const fetchPigPens = async () => {
            try {
                const role = localStorage.getItem('role');
                const employeeId = localStorage.getItem('employeeId');
                
                const pens = role === 'MANAGER' 
                    ? await pigPenService.getAllPigPens()
                    : await pigPenService.findByEmployeeId(employeeId);
                
                // Only show active pens
                const activePens = pens.filter(pen => pen.status === 'ACTIVE');
                setPigPens(activePens);
            } catch (error) {
                console.error('Error fetching pig pens:', error);
            }
        };

        if (open) {
            fetchPigPens();
            if (vaccination) {
                setForm({
                    date: vaccination.date ? new Date(vaccination.date) : null,
                    vaccineType: vaccination.vaccineType || '',
                    note: vaccination.note || '',
                    pen: { id: vaccination.pen?.id || '' }
                });
            }
        }
    }, [open, vaccination]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePenChange = (e) => {
        setForm(prev => ({
            ...prev,
            pen: { id: e.target.value }
        }));
    };

    const handleSubmit = async () => {
        if (!vaccination?.id) return;

        setLoading(true);
        try {
            // Format date to YYYY-MM-DD
            const formattedDate = form.date ? form.date.toISOString().split('T')[0] : '';
            await updateVaccination(vaccination.id, {
                ...form,
                date: formattedDate
            });
            onSuccess();
        } catch (error) {
            console.error('Error updating vaccination:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Cập nhật lịch tiêm phòng</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                        <DatePicker
                            label="Ngày tiêm"
                            value={form.date}
                            onChange={(newValue) => {
                                setForm(prev => ({
                                    ...prev,
                                    date: newValue
                                }));
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            inputFormat="dd/MM/yyyy"
                        />
                    </LocalizationProvider>
                    <TextField
                        label="Loại vaccine"
                        name="vaccineType"
                        value={form.vaccineType}
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
                    <FormControl fullWidth>
                        <InputLabel>Chọn chuồng</InputLabel>
                        <Select
                            value={form.pen?.id || ''}
                            label="Chọn chuồng"
                            onChange={handlePenChange}
                        >
                            {pigPens.map((pen) => (
                                <MenuItem key={pen.penId} value={pen.penId}>
                                    {pen.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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

export default VaccinationUpdateForm;