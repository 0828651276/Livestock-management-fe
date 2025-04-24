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

const CreateMedicalForm = ({ open, animal, onCreate, onCancel }) => {
  const initial = {
    treatmentDate: '',
    treatmentMethod: 'INJECTION',
    veterinarian: '',
    notes: ''
  };
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) {
      setForm(initial);
    }
  }, [open, animal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!animal || !animal.pigId) return;
    onCreate({
      animal: { pigId: animal.pigId },
      treatmentDate: form.treatmentDate,
      treatmentMethod: form.treatmentMethod,
      veterinarian: form.veterinarian,
      notes: form.notes
    });
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Đặt lịch điều trị{animal ? ` - ${animal.name}` : ''}
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
        <Button onClick={handleSubmit} variant="contained">Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMedicalForm; 