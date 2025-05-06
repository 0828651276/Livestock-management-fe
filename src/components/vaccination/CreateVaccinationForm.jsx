import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert
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
  const [error, setError] = useState('');

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
      setError('');
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
    
    // Kiểm tra trạng thái sức khỏe nếu đang thay đổi con vật !
    if (name === 'animal') {
      const selectedAnimal = animals.find(a => a.pigId === value);
      if (selectedAnimal) {
        if (selectedAnimal.healthStatus === 'SICK') {
          setError('Không thể đặt lịch tiêm cho động vật đang bị bệnh');
        } else if (selectedAnimal.medicalStatus === 'SCHEDULED') {
          setError('Không thể đặt lịch tiêm cho động vật đã có lịch chữa trị');
        } else {
          setError('');
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!form.animal) return;
    
    // Kiểm tra lại trạng thái sức khỏe trước khi submit
    const selectedAnimal = animals.find(a => a.pigId === form.animal);
    if (selectedAnimal) {
      if (selectedAnimal.healthStatus === 'SICK') {
        setError('Không thể đặt lịch tiêm cho động vật đang bị bệnh');
        return;
      } else if (selectedAnimal.medicalStatus === 'SCHEDULED') {
        setError('Không thể đặt lịch tiêm cho động vật đã có lịch chữa trị');
        return;
      }
    }
    
    onCreate({
      animal: { pigId: form.animal },
      date: form.date,
      vaccine: form.vaccine,
      note: form.note,
      status: 'SCHEDULED'
    });
  };

  const isFromAnimalManager = !!(animal && animal.pigId);

  // Kiểm tra xem động vật đã chọn có trạng thái sức khỏe phù hợp không
  const checkAnimalStatus = () => {
    if (isFromAnimalManager && animal) {
      const selectedAnimal = animals.find(a => a.pigId === animal.pigId);
      if (selectedAnimal) {
        if (selectedAnimal.healthStatus === 'SICK') {
          setError('Không thể đặt lịch tiêm cho động vật đang bị bệnh');
        } else if (selectedAnimal.medicalStatus === 'SCHEDULED') {
          setError('Không thể đặt lịch tiêm cho động vật đã có lịch chữa trị');
        } else {
          setError('');
        }
      }
    }
  };

  // Kiểm tra khi mở form
  useEffect(() => {
    if (open) {
      checkAnimalStatus();
    }
  }, [open, animal]);

  // Lọc danh sách động vật chỉ hiển thị những con khỏe mạnh
  const healthyAnimals = animals.filter(a => 
    a.healthStatus !== 'SICK' && a.medicalStatus !== 'SCHEDULED'
  );

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Đặt lịch tiêm phòng
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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
              error={!!error}
            >
              {healthyAnimals.map(a => (
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
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!!error || !form.animal || !form.date || !form.vaccine}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVaccinationForm;