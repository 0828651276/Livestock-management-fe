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
  CircularProgress,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Schedule, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { animalService } from '../../services/animalService';
import { vaccinationService } from '../../services/VaccinationService';
import CreateVaccinationForm from './CreateVaccinationForm';
import UpdateVaccinationForm from './UpdateVaccinationForm';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/calendar.css';

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

export default function VaccinationManager() {
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [scheduledRecords, setScheduledRecords] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ date: '', vaccine: '', note: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchScheduledRecords();
    fetchVaccinationHistory();
    fetchAllAnimals();
  }, []);

  const fetchAllAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const data = await animalService.getAll();
      const filtered = data.filter(a => a.raisingStatus !== 'EXPORTED');
      setAnimals(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnimals(false);
    }
  };

  const fetchScheduledRecords = async () => {
    setLoadingScheduled(true);
    try {
      const data = await vaccinationService.getByStatus('SCHEDULED');
      setScheduledRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchVaccinationHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await vaccinationService.getByStatus('COMPLETED');
      setVaccinationHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };
  const handleCloseCreate = () => setOpenCreate(false);

  const handleCreateRecord = async (data) => {
    try {
      await vaccinationService.createMedical({
        animal: { pigId: data.animal?.pigId || data.animal },
        date: data.date,
        vaccine: data.vaccine,
        note: data.note,
        status: 'SCHEDULED'
      });
      setSnackbar({ open: true, message: 'Đặt lịch tiêm phòng thành công', severity: 'success' });
      setOpenCreate(false);
      fetchScheduledRecords();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi đặt lịch tiêm phòng', severity: 'error' });
    }
  };

  const handleOpenUpdate = (record) => {
    setCurrentRecord(record);
    setFormData({
      date: record.date,
      vaccine: record.vaccine,
      note: record.note
    });
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setCurrentRecord(null);
  };

  const confirmDeleteRecord = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteDialog.id) return;
    try {
      await vaccinationService.deleteMedical(deleteDialog.id);
      setSnackbar({ open: true, message: 'Xóa thành công', severity: 'success' });
      fetchScheduledRecords();
      fetchVaccinationHistory();
      setOpenCreate(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Lỗi khi xóa', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const getCalendarEvents = (scheduledRecords) => {
    return scheduledRecords.map(r => ({
      id: r.id,
      title: `${r.animal?.name || ''}`,
      start: r.date,
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      allDay: true
    }));
  };

  const handleEventClick = (clickInfo) => {
    const record = scheduledRecords.find(r => String(r.id) === String(clickInfo.event.id));
    if (record) {
      handleOpenUpdate(record);
    }
  };

  const handleDateClick = (info) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const selectedDate = new Date(info.dateStr);
    selectedDate.setHours(0,0,0,0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    if (selectedDate >= minDate) {
      setSelectedAnimal({ defaultDate: info.dateStr });
      setOpenCreate(true);
    } else {
      setSnackbar({ open: true, message: 'Chỉ được tạo lịch vào ngày cách hôm nay 2 ngày trở đi!', severity: 'warning' });
    }
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const handleCompleteToday = async (record) => {
    if (!record) return;
    try {
      await vaccinationService.updateMedical(record.id, {
        ...record,
        animal: { pigId: record.animal?.pigId },
        status: 'COMPLETED',
      });
      setSnackbar({ open: true, message: 'Đã chuyển vào lịch sử tiêm phòng', severity: 'success' });
      fetchScheduledRecords();
      fetchVaccinationHistory();
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi hoàn thành', severity: 'error' });
    }
  };

  function renderEventContent(arg) {
    const record = scheduledRecords.find(r => String(r.id) === String(arg.event.id));
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{arg.event.title}</span>
        {record && isToday(record.date) && (
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
      <Typography variant="h4" gutterBottom>Lịch Tiêm Phòng</Typography>
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
      <CreateVaccinationForm
        open={openCreate}
        animal={selectedAnimal}
        animals={animals}
        onCreate={handleCreateRecord}
        onCancel={handleCloseCreate}
      />

      {/* Update Dialog */}
      <UpdateVaccinationForm
        open={openUpdate}
        vaccination={currentRecord}
        onSuccess={() => {
          setOpenUpdate(false);
          setCurrentRecord(null);
          fetchScheduledRecords();
          fetchVaccinationHistory();
          setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        }}
        onCancel={handleCloseUpdate}
      />

      {/* Dialog xác nhận xóa lịch tiêm phòng */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa lịch tiêm phòng này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} color="inherit">Hủy</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Bảng lịch sử tiêm phòng */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>Lịch sử tiêm phòng</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Ngày tiêm phòng</StyledTableCell>
                <StyledTableCell>Tên động vật</StyledTableCell>
                <StyledTableCell>Loại vắc xin</StyledTableCell>
                <StyledTableCell>Ghi chú</StyledTableCell>
                <StyledTableCell>Trạng thái</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingHistory ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : vaccinationHistory.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">Không có dữ liệu</TableCell></TableRow>
              ) : vaccinationHistory.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{row.date}</StyledTableCell>
                  <StyledTableCell>{row.animal?.name || ''}</StyledTableCell>
                  <StyledTableCell>{row.vaccine}</StyledTableCell>
                  <StyledTableCell>{row.note}</StyledTableCell>
                  <StyledTableCell>{row.status === 'COMPLETED' ? 'Đã tiêm' : 'Chưa tiêm'}</StyledTableCell>
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