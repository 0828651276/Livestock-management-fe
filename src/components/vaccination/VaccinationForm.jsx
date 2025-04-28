import React, { useState, useEffect } from 'react';
import { TextField, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { pigPenService } from '../../services/pigPenService';
import { getAllVaccinations } from '../../services/VaccinationService';

export default function VaccinationForm({ form, setForm, onSave, onCancel }) {
    const [pigPens, setPigPens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const role = localStorage.getItem('role');
                const employeeId = localStorage.getItem('employeeId');
                
                // Fetch both pens and vaccinations
                const [pensResponse, vaccinationsResponse] = await Promise.all([
                    role === 'MANAGER' 
                        ? pigPenService.getAllPigPens() 
                        : pigPenService.findByEmployeeId(employeeId),
                    getAllVaccinations()
                ]);
                
                // Get pens that have vaccinations
                const pensWithVaccinations = new Set(
                    vaccinationsResponse.data.map(v => v.pen?.id)
                );
                
                // Filter out pens that already have vaccinations and inactive pens
                const availablePens = pensResponse.filter(pen => 
                    pen.status === 'ACTIVE' && !pensWithVaccinations.has(pen.penId)
                );
                
                setPigPens(availablePens);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DialogContent className="flex flex-col gap-4 mt-2">
            <TextField
                label="Ngày tiêm"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <TextField
                label="Loại vaccine"
                fullWidth
                value={form.vaccineType}
                onChange={(e) => setForm({ ...form, vaccineType: e.target.value })}
            />
            <TextField
                label="Ghi chú"
                fullWidth
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <FormControl fullWidth>
                <InputLabel>Chọn chuồng</InputLabel>
                <Select
                    value={form.pen?.id || ''}
                    label="Chọn chuồng"
                    onChange={(e) => setForm({ ...form, pen: { id: e.target.value } })}
                >
                    {loading ? (
                        <MenuItem disabled>Đang tải...</MenuItem>
                    ) : pigPens.length > 0 ? (
                        pigPens.map((pen) => (
                            <MenuItem key={pen.penId} value={pen.penId}>
                                {pen.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Không có chuồng nào khả dụng</MenuItem>
                    )}
                </Select>
            </FormControl>
            <DialogActions>
                <Button onClick={onCancel}>Huỷ</Button>
                <Button variant="contained" onClick={onSave}>Lưu</Button>
            </DialogActions>
        </DialogContent>
    );
}
