import React from 'react';
import { TextField, DialogContent, DialogActions, Button } from '@mui/material';

export default function VaccinationForm({ form, setForm, onSave, onCancel }) {
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
            <TextField
                label="ID Chuồng"
                fullWidth
                value={form.pen.id}
                onChange={(e) => setForm({ ...form, pen: { id: e.target.value } })}
            />
            <DialogActions>
                <Button onClick={onCancel}>Huỷ</Button>
                <Button variant="contained" onClick={onSave}>Lưu</Button>
            </DialogActions>
        </DialogContent>
    );
}
