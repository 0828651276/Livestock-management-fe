import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Schedule } from '@mui/icons-material';
import { animalService } from '../../services/animalService';
import { medicalService } from '../../services/medicalService';
import CreateMedicalForm from './CreateMedicalForm';
import { useNavigate } from 'react-router-dom';

export default function MedicalManager() {
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [displayedRecords, setDisplayedRecords] = useState([]);
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ treatmentDate: '', treatmentMethod: '', veterinarian: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openCreate, setOpenCreate] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [medicalToEdit, setMedicalToEdit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSickAnimals();
    fetchAllMedical();
  }, []);

  const fetchSickAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const data = await animalService.getByHealthStatus('SICK');
      setAnimals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnimals(false);
    }
  };

  const fetchAllMedical = async () => {
    setLoadingMedicals(true);
    try {
      const data = await medicalService.getAllMedical();
      setMedicalRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMedicals(false);
    }
  };

  const handleSchedule = (animal) => {
    setSelectedAnimal(animal);
    const filtered = medicalRecords.filter(r => r.animal.pigId === animal.pigId);
    setDisplayedRecords(filtered);
    setOpenCreate(true);
  };

  const handleCloseCreate = () => setOpenCreate(false);

  const handleCreateRecord = async (data) => {
    try {
      await medicalService.createMedical(data);
      setSnackbar({ open: true, message: 'Đặt lịch thành công', severity: 'success' });
      handleCloseCreate();
      const all = await medicalService.getAllMedical();
      setMedicalRecords(all);
      if (selectedAnimal) {
        const filtered = all.filter(r => r.animal.pigId === selectedAnimal.pigId);
        setDisplayedRecords(filtered);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi đặt lịch', severity: 'error' });
    }
  };

  const handleOpenUpdate = (record) => {
    setCurrentRecord(record);
    setFormData({
      treatmentDate: record.treatmentDate,
      treatmentMethod: record.treatmentMethod,
      veterinarian: record.veterinarian,
      notes: record.notes
    });
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setCurrentRecord(null);
  };

  const handleUpdateRecord = async () => {
    try {
      await medicalService.updateMedical(currentRecord.id, {
        animal: { pigId: selectedAnimal.pigId },
        treatmentDate: formData.treatmentDate,
        treatmentMethod: formData.treatmentMethod,
        veterinarian: formData.veterinarian,
        notes: formData.notes
      });
      setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
      handleCloseUpdate();
      fetchAllMedical();
      if (selectedAnimal) handleSchedule(selectedAnimal);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật', severity: 'error' });
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
    try {
      await medicalService.deleteMedical(id);
      setSnackbar({ open: true, message: 'Xóa thành công', severity: 'success' });
      fetchAllMedical();
      if (selectedAnimal) handleSchedule(selectedAnimal);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi xóa', severity: 'error' });
    }
  };

  const handleEditMedical = (medical) => {
    setMedicalToEdit(medical);
    setShowUpdateForm(true);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
    setMedicalToEdit(null);
  };

  const handleUpdateSuccess = () => {
    handleCloseUpdateForm();
    fetchAllMedical();
    if (selectedAnimal) handleSchedule(selectedAnimal);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Medical Manager</Typography>
      <Typography variant="h6">Danh sách động vật bị ốm</Typography>
      {loadingAnimals ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Ngày nhập</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.map(a => (
                <TableRow key={a.pigId}>
                  <TableCell>{a.pigId}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.entryDate}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<Schedule />}
                      onClick={() => handleSchedule(a)}
                    >
                      Đặt lịch
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6">Lịch sử điều trị</Typography>
      {loadingMedicals ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ngày điều trị</TableCell>
                <TableCell>Phương pháp</TableCell>
                <TableCell>Thú y</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRecords.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.treatmentDate}</TableCell>
                  <TableCell>{r.treatmentMethod}</TableCell>
                  <TableCell>{r.veterinarian}</TableCell>
                  <TableCell>{r.notes}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenUpdate(r)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDeleteRecord(r.id)}><Delete /></IconButton>
                    <button onClick={() => handleEditMedical(r)}>Sửa</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Form Dialog */}
      <CreateMedicalForm
        open={openCreate}
        animal={selectedAnimal}
        onCreate={handleCreateRecord}
        onCancel={handleCloseCreate}
      />

      {/* Update Dialog */}
      <Dialog open={openUpdate} onClose={handleCloseUpdate} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật điều trị</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Ngày điều trị"
              type="date"
              name="treatmentDate"
              value={formData.treatmentDate}
              onChange={e => setFormData(prev => ({ ...prev, treatmentDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Phương pháp"
              name="treatmentMethod"
              value={formData.treatmentMethod}
              onChange={e => setFormData(prev => ({ ...prev, treatmentMethod: e.target.value }))}
            >
              <MenuItem value="INJECTION">Tiêm</MenuItem>
              <MenuItem value="ORAL">Cho uống</MenuItem>
            </TextField>
            <TextField
              label="Thú y"
              name="veterinarian"
              value={formData.veterinarian}
              onChange={e => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
            />
            <TextField
              label="Ghi chú"
              name="notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdate}>Hủy</Button>
          <Button onClick={handleUpdateRecord} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {showUpdateForm && (
        <UpdateMedicalForm
          medical={medicalToEdit}
          animals={animals}
          onSuccess={handleUpdateSuccess}
          onCancel={handleCloseUpdateForm}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}