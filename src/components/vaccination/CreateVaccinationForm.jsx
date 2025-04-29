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

const CreateVaccinationForm = ({ open, animal, animals = [], onCreate, onCancel }) => {
  const initial = {
    animal: animal?.pigId || '',
    date: '',
    vaccine: '',
    note: '',
    status: 'SCHEDULED'
  };
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        animal: animal?.pigId || '',
        date: '',
        vaccine: '',
        note: '',
        status: 'SCHEDULED'
      }));
    }
  }, [animal, open]);

  useEffect(() => {
    if (open && animal && animal.defaultDate) {
      setForm(prev => ({
        ...prev,
        animal: animal?.pigId || '',
        date: animal.defaultDate,
        vaccine: '',
        note: '',
        status: 'SCHEDULED'
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
      date: form.date,
      vaccine: form.vaccine,
      note: form.note,
      status: 'SCHEDULED'
    });
  };

  const isFromAnimalManager = !!(animal && animal.pigId);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Đặt lịch tiêm phòng
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {!isFromAnimalManager && (
            <TextField
              select
              label="Chọn động vật"
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
            label="Ngày tiêm phòng"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          <TextField
            label="Loại vắc xin"
            name="vaccine"
            value={form.vaccine}
            onChange={handleChange}
            fullWidth
            required
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
        <Button onClick={handleSubmit} variant="contained">Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVaccinationForm; 