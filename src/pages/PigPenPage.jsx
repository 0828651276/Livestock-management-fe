import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Snackbar,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';

// Import services
import { pigPenService } from '../services/pigPenService';
import { employeeService } from '../services/EmployeeService.js';

// Header cột của bảng
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    padding: '16px'
}));

// Styled component cho Paper
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
}));

function PigPenPage() {
    const navigate = useNavigate();
    const [pigPens, setPigPens] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [currentPigPen, setCurrentPigPen] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        caretakerId: '',
        createdDate: new Date().toISOString().split('T')[0],
        closedDate: null,
        quantity: 0
    });

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Lấy dữ liệu từ backend
                const [pigPensData, employeesData] = await Promise.all([
                    pigPenService.getAllPigPens(),
                    employeeService.getAllEmployees()
                ]);

                setPigPens(pigPensData);
                setEmployees(employeesData);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                showSnackbar('Lỗi khi tải dữ liệu từ server', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleAddPigPen = () => {
        setCurrentPigPen(null);
        setFormData({
            name: '',
            caretakerId: '',
            createdDate: new Date().toISOString().split('T')[0],
            closedDate: null,
            quantity: 0
        });
        setOpenDialog(true);
    };

    const handleEditPigPen = (pigPen) => {
        setCurrentPigPen(pigPen);
        setFormData({
            name: pigPen.name,
            caretakerId: pigPen.caretaker?.employeeId || '',
            createdDate: pigPen.createdDate,
            closedDate: pigPen.closedDate,
            quantity: pigPen.quantity
        });
        setOpenDialog(true);
    };

    const handleDeletePigPen = (pigPen) => {
        setCurrentPigPen(pigPen);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await pigPenService.deletePigPen(currentPigPen.penId);
            setPigPens(pigPens.filter(pen => pen.penId !== currentPigPen.penId));
            showSnackbar('Xóa chuồng thành công');
        } catch (error) {
            console.error('Lỗi khi xóa chuồng:', error);
            showSnackbar('Lỗi khi xóa chuồng', 'error');
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            const pigPenData = {
                name: formData.name,
                caretakerId: formData.caretakerId,
                createdDate: formData.createdDate,
                closedDate: formData.closedDate,
                quantity: parseInt(formData.quantity)
            };

            let response;
            if (currentPigPen) {
                // Cập nhật
                response = await pigPenService.updatePigPen(currentPigPen.penId, pigPenData);
                setPigPens(pigPens.map(pen =>
                    pen.penId === currentPigPen.penId ? response : pen
                ));
                showSnackbar('Cập nhật chuồng thành công');
            } else {
                // Tạo mới
                response = await pigPenService.createPigPen(pigPenData);
                setPigPens([...pigPens, response]);
                showSnackbar('Tạo chuồng mới thành công');
            }

            setOpenDialog(false);
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu chuồng:', error);
            showSnackbar('Lỗi khi lưu dữ liệu', 'error');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Hiển thị trạng thái chuồng
    const getPenStatus = (closedDate) => {
        return closedDate
            ? <Chip label="Đã đóng" color="error" size="small" />
            : <Chip label="Đang hoạt động" color="success" size="small" />;
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Nút quay lại và tiêu đề */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={handleBackToDashboard}
                    sx={{ mr: 2, bgcolor: '#f5f5f5' }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Quản lý chuồng lợn
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddPigPen}
                    sx={{
                        backgroundColor: '#1E8449',
                        '&:hover': {
                            backgroundColor: '#14532d'
                        }
                    }}
                >
                    Thêm chuồng mới
                </Button>
            </Box>

            {/* Danh sách chuồng */}
            <StyledPaper>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Danh sách chuồng lợn
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: 440, overflow: 'auto' }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>ID</StyledTableCell>
                                    <StyledTableCell>Tên chuồng</StyledTableCell>
                                    <StyledTableCell>Người phụ trách</StyledTableCell>
                                    <StyledTableCell>Ngày tạo</StyledTableCell>
                                    <StyledTableCell>Ngày đóng</StyledTableCell>
                                    <StyledTableCell>Số lượng</StyledTableCell>
                                    <StyledTableCell>Trạng thái</StyledTableCell>
                                    <StyledTableCell align="center">Thao tác</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pigPens.length > 0 ? (
                                    pigPens.map((pigPen) => (
                                        <TableRow key={pigPen.penId} hover>
                                            <TableCell>{pigPen.penId}</TableCell>
                                            <TableCell>{pigPen.name}</TableCell>
                                            <TableCell>{pigPen.caretaker?.fullName || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(pigPen.createdDate)}</TableCell>
                                            <TableCell>{formatDate(pigPen.closedDate)}</TableCell>
                                            <TableCell>{pigPen.quantity}</TableCell>
                                            <TableCell>{getPenStatus(pigPen.closedDate)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditPigPen(pigPen)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeletePigPen(pigPen)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </StyledPaper>

            {/* Form dialog thêm/sửa chuồng */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentPigPen ? 'Cập nhật thông tin chuồng' : 'Thêm chuồng mới'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <TextField
                                autoFocus
                                margin="normal"
                                name="name"
                                label="Tên chuồng"
                                fullWidth
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>

                        <Grid xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="caretaker-label">Người phụ trách</InputLabel>
                                <Select
                                    labelId="caretaker-label"
                                    name="caretakerId"
                                    value={formData.caretakerId}
                                    onChange={handleFormChange}
                                    label="Người phụ trách"
                                >
                                    <MenuItem value="">
                                        <em>-- Chọn người phụ trách --</em>
                                    </MenuItem>
                                    {employees.map((employee) => (
                                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                                            {employee.fullName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                name="createdDate"
                                label="Ngày tạo"
                                type="date"
                                fullWidth
                                value={formData.createdDate}
                                onChange={handleFormChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                name="closedDate"
                                label="Ngày đóng"
                                type="date"
                                fullWidth
                                value={formData.closedDate || ''}
                                onChange={handleFormChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid xs={12}>
                            <TextField
                                margin="normal"
                                name="quantity"
                                label="Số lượng"
                                type="number"
                                fullWidth
                                value={formData.quantity}
                                onChange={handleFormChange}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        sx={{
                            backgroundColor: '#1E8449',
                            '&:hover': {
                                backgroundColor: '#14532d'
                            }
                        }}
                    >
                        {currentPigPen ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa chuồng "{currentPigPen?.name}" không?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PigPenPage;