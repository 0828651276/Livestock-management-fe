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
import { Edit, Delete, Schedule, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { animalService } from '../../services/animalService';
import { medicalService } from '../../services/medicalService';
import CreateMedicalForm from './CreateMedicalForm';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/calendar.css'// import '@fullcalendar/daygrid/main.css';

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
  const [openUpdate, setOpenUpdate] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ treatmentDate: '', treatmentMethod: '', veterinarian: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [scheduledRecords, setScheduledRecords] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchScheduledRecords();
    fetchTreatmentHistory();
    fetchSickAnimals();
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

  const fetchScheduledRecords = async () => {
    setLoadingScheduled(true);
    try {
      const data = await medicalService.getByStatus('SCHEDULED');
      setScheduledRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchTreatmentHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await medicalService.getByStatus('COMPLETED');
      setTreatmentHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseCreate = () => setOpenCreate(false);

  const handleCreateRecord = async (data) => {
    try {
      await medicalService.createMedical(data);
      setSnackbar({ open: true, message: 'Đặt lịch thành công', severity: 'success' });
      setOpenCreate(false);
      fetchScheduledRecords();
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
    if (!currentRecord || !currentRecord.animal || !currentRecord.animal.pigId) {
      setSnackbar({ open: true, message: 'Không có thông tin động vật để cập nhật.', severity: 'error' });
      return;
    }
    try {
      await medicalService.updateMedical(currentRecord.id, {
        animal: { pigId: currentRecord.animal.pigId },
        treatmentDate: formData.treatmentDate,
        treatmentMethod: formData.treatmentMethod,
        veterinarian: formData.veterinarian,
        notes: formData.notes
      });
      setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
      setOpenUpdate(false);
      setCurrentRecord(null);
      fetchScheduledRecords();
      fetchTreatmentHistory();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật', severity: 'error' });
    }
  };

  const confirmDeleteRecord = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteDialog.id) return;
    try {
      await medicalService.deleteMedical(deleteDialog.id);
      setSnackbar({ open: true, message: 'Xóa thành công', severity: 'success' });
      fetchScheduledRecords();
      fetchTreatmentHistory();
      setOpenCreate(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi xóa', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  // Thêm hàm chuyển đổi phương pháp
  const getMethodLabel = (method) => {
    if (method === "INJECTION") return "Tiêm";
    if (method === "ORAL") return "Uống thuốc";
    return method;
  };

  // Sử dụng scheduledRecords cho FullCalendar
  const getCalendarEvents = (scheduledRecords) => {
    return scheduledRecords.map(r => ({
      id: r.id,
      title: `${r.animal?.name || ''}`,
      start: r.treatmentDate,
      backgroundColor: r.treatmentMethod === 'INJECTION' ? '#1976d2' : '#43a047',
      borderColor: r.treatmentMethod === 'INJECTION' ? '#1976d2' : '#43a047',
      allDay: true
    }));
  };

  // Khi click vào event trên FullCalendar, mở dialog cập nhật
  const handleEventClick = (clickInfo) => {
    const record = scheduledRecords.find(r => String(r.id) === String(clickInfo.event.id));
    if (record) {
      handleOpenUpdate(record);
    }
  };

  // Chỉ cho phép tạo mới lịch vào ngày >= hôm nay + 2
  const handleDateClick = (info) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const selectedDate = new Date(info.dateStr);
    selectedDate.setHours(0,0,0,0);

    // Ngày cho phép: từ hôm nay + 2 trở đi
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);

    if (selectedDate >= minDate) {
      setSelectedAnimal({ defaultDate: info.dateStr });
      setOpenCreate(true);
    } else {
      setSnackbar({ open: true, message: 'Chỉ được tạo lịch vào ngày cách hôm nay 2 ngày trở đi!', severity: 'warning' });
    }
  };

  // Hàm kiểm tra có phải lịch hôm nay không
  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
    );
  };

  // Hàm xử lý tích hoàn thành: giữ nguyên treatmentDate
  const handleCompleteToday = async (record) => {
    if (!record) return;
    try {
      await medicalService.updateMedical(record.id, {
        ...record,
        animal: { pigId: record.animal?.pigId },
        status: 'COMPLETED',
      });
      setSnackbar({ open: true, message: 'Đã chuyển vào lịch sử chữa trị', severity: 'success' });
      fetchScheduledRecords();
      fetchTreatmentHistory();
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi hoàn thành', severity: 'error' });
    }
  };

  // Hiển thị nút tích hoàn thành trên event hôm nay
  function renderEventContent(arg) {
    const record = scheduledRecords.find(r => String(r.id) === String(arg.event.id));
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{arg.event.title}</span>
          {record && isToday(record.treatmentDate) && (
              <IconButton
                  size="small"
                  color="success"
                  style={{marginLeft: 4, padding: 2}}
                  onClick={e => {
                    e.stopPropagation();
                    handleCompleteToday(record);
                  }}
                  title="Hoàn thành và chuyển vào lịch sử"
              >
                <CheckCircle fontSize="small" />
              </IconButton>
          )}
          <IconButton
              size="small"
              color="error"
              style={{marginLeft: 4, padding: 2}}
              onClick={e => {
                e.stopPropagation();
                confirmDeleteRecord(arg.event.id);
              }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
    );
  }

  return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Medical Manager</Typography>
        <Box sx={{ mb: 4 }}>
          <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="vi"
              events={getCalendarEvents(scheduledRecords)}
              height={550}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventContent={renderEventContent}
          />
        </Box>

        {/* Create Form Dialog */}
        <CreateMedicalForm
            open={openCreate}
            animal={selectedAnimal}
            animals={animals}
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
                <MenuItem value="ORAL">Uống thuốc</MenuItem>
              </TextField>
              <TextField
                  label="Địa chỉ"
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

        {/* Dialog xác nhận xóa lịch chữa trị */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>Bạn có chắc chắn muốn xóa lịch chữa trị này không?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null })} color="inherit">Hủy</Button>
            <Button onClick={handleDeleteConfirmed} color="error" variant="contained">Xóa</Button>
          </DialogActions>
        </Dialog>

        {/* Bảng lịch sử chữa trị */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>Lịch sử chữa trị</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Ngày điều trị</StyledTableCell>
                  <StyledTableCell>Tên động vật</StyledTableCell>
                  <StyledTableCell>Phương pháp</StyledTableCell>
                  <StyledTableCell>Địa chỉ</StyledTableCell>
                  <StyledTableCell>Ghi chú</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                    <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : treatmentHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">Không có dữ liệu</TableCell></TableRow>
                ) : treatmentHistory.map((row) => (
                    <StyledTableRow key={row.id}>
                      <StyledTableCell>{row.treatmentDate}</StyledTableCell>
                      <StyledTableCell>{row.animal?.name || ''}</StyledTableCell>
                      <StyledTableCell>{getMethodLabel(row.treatmentMethod)}</StyledTableCell>
                      <StyledTableCell>{row.veterinarian}</StyledTableCell>
                      <StyledTableCell>{row.notes}</StyledTableCell>
                    </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
}