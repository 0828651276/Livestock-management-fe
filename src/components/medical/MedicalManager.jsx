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
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { animalService } from '../../services/animalService';
import { medicalService } from '../../services/medicalService';
import CreateMedicalForm from './CreateMedicalForm';
import { useNavigate } from 'react-router-dom';

// styled table cells and rows for nicer UI
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function MedicalManager() {
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ treatmentDate: '', treatmentMethod: '', veterinarian: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();

  // derive set of pigIds already scheduled
  const scheduledSet = React.useMemo(
    () => new Set(medicalRecords.map(r => r.animal.pigId)),
    [medicalRecords]
  );

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
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Tên</StyledTableCell>
                <StyledTableCell>Ngày nhập</StyledTableCell>
                <StyledTableCell>Hành động</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.map(a => (
                <StyledTableRow key={a.pigId} hover>
                  <StyledTableCell>{a.pigId}</StyledTableCell>
                  <StyledTableCell>{a.name}</StyledTableCell>
                  <StyledTableCell>{a.entryDate}</StyledTableCell>
                  <StyledTableCell>
                    {scheduledSet.has(a.pigId) ? (
                      <Button disabled variant="outlined">
                        Đã đặt lịch
                      </Button>
                    ) : (
                      <Button
                        startIcon={<Schedule />}
                        onClick={() => handleSchedule(a)}
                      >
                        Đặt lịch
                      </Button>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6">Lịch sử điều trị{selectedAnimal ? ` - ${selectedAnimal.name}` : ''}</Typography>
      {loadingMedicals ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Tên động vật</StyledTableCell>
                <StyledTableCell>Ngày điều trị</StyledTableCell>
                <StyledTableCell>Phương pháp</StyledTableCell>
                <StyledTableCell>Thú y</StyledTableCell>
                <StyledTableCell>Ghi chú</StyledTableCell>
                <StyledTableCell>Hành động</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicalRecords.map(r => (
                <StyledTableRow key={r.id} hover>
                  <StyledTableCell>{r.animal?.name}</StyledTableCell>
                  <StyledTableCell>{r.treatmentDate}</StyledTableCell>
                  <StyledTableCell>{r.treatmentMethod}</StyledTableCell>
                  <StyledTableCell>{r.veterinarian}</StyledTableCell>
                  <StyledTableCell>{r.notes}</StyledTableCell>
                  <StyledTableCell>
                    <IconButton onClick={() => handleOpenUpdate(r)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDeleteRecord(r.id)}><Delete /></IconButton>
                  </StyledTableCell>
                </StyledTableRow>
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
              label="Tên động vật"
              value={currentRecord?.animal?.name || ''}
              disabled
              fullWidth
            />
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