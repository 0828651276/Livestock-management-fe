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

const CreateMedicalForm = ({ open, animal, animals = [], onCreate, onCancel }) => {
  const initial = {
    animal: animal?.pigId || '',
    treatmentDate: '',
    treatmentMethod: 'INJECTION',
    veterinarian: '',
    notes: ''
  };
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        animal: animal?.pigId || '',
        treatmentDate: '',
        treatmentMethod: 'INJECTION',
        veterinarian: '',
        notes: ''
      }));
    }
  }, [animal, open]);

  useEffect(() => {
    if (open && animal && animal.defaultDate) {
      setForm(prev => ({
        ...prev,
        animal: animal?.pigId || '',
        treatmentDate: animal.defaultDate,
        treatmentMethod: 'INJECTION',
        veterinarian: '',
        notes: ''
      }));
    }
  }, [animal, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.animal) return;
    onCreate({
      animal: { pigId: form.animal },
      treatmentDate: form.treatmentDate,
      treatmentMethod: form.treatmentMethod,
      veterinarian: form.veterinarian,
      notes: form.notes
    });
  };

  // Xác định có phải mở từ AnimalManager không
  const isFromAnimalManager = !!(animal && animal.pigId);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Đặt lịch điều trị
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Ẩn ô chọn động vật bị bệnh chỉ khi đặt lịch từ AnimalManager (có pigId) */}
          {!isFromAnimalManager && (
            <TextField
              select
              label="Chọn động vật bị bệnh"
              name="animal"
              value={form.animal}
              onChange={handleChange}
              fullWidth
              required
            >
              {animals.map(a => (
                <MenuItem key={a.pigId} value={a.pigId}>{a.name}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Ngày điều trị"
            type="date"
            name="treatmentDate"
            value={form.treatmentDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          <TextField
            select
            label="Phương pháp"
            name="treatmentMethod"
            value={form.treatmentMethod}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="INJECTION">Tiêm</MenuItem>
            <MenuItem value="ORAL">Uống thuốc</MenuItem>
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