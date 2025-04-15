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
    Grid,
    Snackbar,
    Alert,
    CircularProgress,
    Chip,
    TablePagination,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

// Import services
import { pigPenService } from '../services/pigPenService';
import { employeeService } from '../services/EmployeeService';

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
    const [filteredPigPens, setFilteredPigPens] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [currentPigPen, setCurrentPigPen] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        createdDate: new Date().toISOString().split('T')[0],
        closedDate: null,
        quantity: 0,
        caretaker: null
    });

    // Fetch data function
    const fetchData = async () => {
        try {
            setLoading(true);
            // Lấy dữ liệu chuồng từ backend
            const pigPensData = await pigPenService.getAllPigPens();
            setPigPens(pigPensData);
            setFilteredPigPens(pigPensData);

            // Lấy dữ liệu nhân viên để chọn người phụ trách
            const employeesResponse = await employeeService.getAll();
            setEmployees(employeesResponse.data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showSnackbar('Lỗi khi tải dữ liệu từ server', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Xử lý tìm kiếm và lọc
    useEffect(() => {
        // Áp dụng tất cả các bộ lọc
        let filtered = [...pigPens];

        // Lọc theo tên
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(pen =>
                pen.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo khoảng ngày tạo
        if (dateRange.startDate && dateRange.endDate) {
            const startDate = parseISO(dateRange.startDate);
            const endDate = parseISO(dateRange.endDate);

            filtered = filtered.filter(pen => {
                const createdDate = parseISO(pen.createdDate);
                return (
                    (isAfter(createdDate, startDate) || isEqual(createdDate, startDate)) &&
                    (isBefore(createdDate, endDate) || isEqual(createdDate, endDate))
                );
            });
        } else if (dateRange.startDate) {
            const startDate = parseISO(dateRange.startDate);
            filtered = filtered.filter(pen => {
                const createdDate = parseISO(pen.createdDate);
                return isAfter(createdDate, startDate) || isEqual(createdDate, startDate);
            });
        } else if (dateRange.endDate) {
            const endDate = parseISO(dateRange.endDate);
            filtered = filtered.filter(pen => {
                const createdDate = parseISO(pen.createdDate);
                return isBefore(createdDate, endDate) || isEqual(createdDate, endDate);
            });
        }

        setFilteredPigPens(filtered);
        setPage(0); // Reset về trang đầu tiên khi áp dụng bộ lọc
    }, [searchTerm, dateRange, pigPens]);

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
            createdDate: new Date().toISOString().split('T')[0],
            closedDate: null,
            quantity: 0,
            caretaker: null
        });
        setOpenDialog(true);
    };

    const handleEditPigPen = (pigPen) => {
        setCurrentPigPen(pigPen);
        setFormData({
            name: pigPen.name || '',
            createdDate: pigPen.createdDate || new Date().toISOString().split('T')[0],
            closedDate: pigPen.closedDate || '',
            quantity: pigPen.quantity || 0,
            caretaker: pigPen.caretaker ? pigPen.caretaker.employeeId : ''
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
            const updatedPigPens = pigPens.filter(pen => pen.penId !== currentPigPen.penId);
            setPigPens(updatedPigPens);
            // Bộ lọc sẽ được áp dụng lại thông qua useEffect
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

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggleDateFilter = () => {
        setShowDateFilter(!showDateFilter);
        if (showDateFilter) {
            // Xóa bộ lọc ngày khi ẩn
            setDateRange({
                startDate: '',
                endDate: ''
            });
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange({
            startDate: '',
            endDate: ''
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async () => {
        try {
            const pigPenData = {
                name: formData.name,
                createdDate: formData.createdDate,
                closedDate: formData.closedDate || null,
                quantity: parseInt(formData.quantity || 0),
                caretaker: formData.caretaker ? { employeeId: formData.caretaker } : null
            };

            let response;
            if (currentPigPen) {
                // Cập nhật
                response = await pigPenService.updatePigPen(currentPigPen.penId, pigPenData);
                // Cập nhật lại dữ liệu trong state
                const updatedPen = { ...response };
                // Nếu có người phụ trách, tìm thông tin đầy đủ của nhân viên từ danh sách
                if (formData.caretaker) {
                    const employee = employees.find(emp => emp.employeeId === formData.caretaker);
                    if (employee) {
                        updatedPen.caretaker = employee;
                    }
                }
                setPigPens(prevPens =>
                    prevPens.map(pen => pen.penId === currentPigPen.penId ? updatedPen : pen)
                );
                showSnackbar('Cập nhật chuồng thành công');
            } else {
                // Tạo mới
                response = await pigPenService.createPigPen(pigPenData);
                // Cập nhật lại dữ liệu trong state
                const newPen = { ...response };
                // Nếu có người phụ trách, tìm thông tin đầy đủ của nhân viên từ danh sách
                if (formData.caretaker) {
                    const employee = employees.find(emp => emp.employeeId === formData.caretaker);
                    if (employee) {
                        newPen.caretaker = employee;
                    }
                }
                setPigPens(prevPens => [...prevPens, newPen]);
                showSnackbar('Tạo chuồng mới thành công');
            }

            setOpenDialog(false);
            // Đóng form và làm mới dữ liệu
            fetchData();
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
            ? <Chip label="Đã đóng" color="error" size="small" sx={{ fontWeight: 'bold' }} />
            : <Chip label="Đang hoạt động" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    };

    // Tìm tên nhân viên theo ID
    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.employeeId === employeeId);
        return employee ? employee.fullName : 'N/A';
    };

    // Tính toán số chuồng sẽ hiển thị
    const emptyRows = page > 0
        ? Math.max(0, (1 + page) * rowsPerPage - filteredPigPens.length)
        : 0;

    // Lấy dữ liệu cho trang hiện tại
    const displayedPigPens = filteredPigPens.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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

            {/* Thanh tìm kiếm và lọc */}
            <StyledPaper sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên chuồng..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterAltIcon />}
                            onClick={handleToggleDateFilter}
                            sx={{ mr: 1 }}
                        >
                            {showDateFilter ? 'Ẩn bộ lọc ngày' : 'Lọc theo ngày tạo'}
                        </Button>
                        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                            <Button
                                variant="text"
                                color="inherit"
                                onClick={handleResetFilters}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Grid>

                    {showDateFilter && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    name="startDate"
                                    label="Từ ngày"
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    name="endDate"
                                    label="Đến ngày"
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </StyledPaper>

            {/* Danh sách chuồng */}
            <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Danh sách chuồng lợn
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Tổng số: {filteredPigPens.length} chuồng
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
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
                                {displayedPigPens.length > 0 ? (
                                    displayedPigPens.map((pigPen) => (
                                        <TableRow key={pigPen.penId} hover>
                                            <TableCell>{pigPen.penId}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{pigPen.name}</TableCell>
                                            <TableCell>
                                                {pigPen.caretaker ? pigPen.caretaker.fullName : ''}
                                            </TableCell>
                                            <TableCell>{formatDate(pigPen.createdDate)}</TableCell>
                                            <TableCell>{formatDate(pigPen.closedDate)}</TableCell>
                                            <TableCell>{pigPen.quantity}</TableCell>
                                            <TableCell>{getPenStatus(pigPen.closedDate)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditPigPen(pigPen)}
                                                    size="small"
                                                    sx={{ color: 'green' }}
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
                                            {(searchTerm || dateRange.startDate || dateRange.endDate) ?
                                                'Không tìm thấy chuồng phù hợp với điều kiện tìm kiếm' :
                                                'Không có dữ liệu'}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={8} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[7]}
                            component="div"
                            count={filteredPigPens.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelDisplayedRows={({ from, to, count }) =>
                                `Trang ${page + 1} / ${Math.ceil(count / rowsPerPage) || 1}`
                            }
                            backIconButtonProps={{
                                'aria-label': 'Trang trước',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Trang tiếp theo',
                            }}
                            labelRowsPerPage=""
                        />
                    </TableContainer>
                )}
            </StyledPaper>

            {/* Form dialog thêm/sửa chuồng */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'bold', pb: 1 }}>
                    {currentPigPen ? 'Cập nhật thông tin chuồng' : 'Thêm chuồng mới'}
                </DialogTitle>
                <DialogContent sx={{ padding: 0 }}>
                    <Box sx={{ borderBottom: '1px solid #e0e0e0', p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: '#666', fontSize: '0.9rem' }}>
                            Người phụ trách
                        </Typography>
                        <FormControl fullWidth variant="outlined" size="medium" sx={{ mb: 3 }}>
                            <Select
                                id="caretaker-select"
                                name="caretaker"
                                value={formData.caretaker || ''}
                                onChange={handleFormChange}
                                displayEmpty
                                sx={{
                                    borderColor: '#1E8449',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1E8449'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1E8449'
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>Không phân công</em>
                                </MenuItem>
                                {employees
                                    .filter(emp => emp.role !== "MANAGER") // Chỉ hiển thị nhân viên, không phải quản lý
                                    .map(employee => (
                                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                                            {employee.fullName} ({employee.employeeId})
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: '#666', fontSize: '0.9rem' }}>
                                Tên chuồng *
                            </Typography>
                            <TextField
                                autoFocus
                                name="name"
                                fullWidth
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                                size="medium"
                                variant="outlined"
                                placeholder="Nhập tên chuồng"
                                InputProps={{
                                    sx: {
                                        borderRadius: 1
                                    }
                                }}
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 1, color: '#666', fontSize: '0.9rem' }}>
                                    Ngày tạo
                                </Typography>
                                <TextField
                                    name="createdDate"
                                    type="date"
                                    fullWidth
                                    value={formData.createdDate}
                                    onChange={handleFormChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" edge="end">
                                                    <CalendarTodayIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 1, color: '#666', fontSize: '0.9rem' }}>
                                    Ngày đóng
                                </Typography>
                                <TextField
                                    name="closedDate"
                                    type="date"
                                    fullWidth
                                    value={formData.closedDate || ''}
                                    onChange={handleFormChange}
                                    placeholder="mm/dd/yyyy"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" edge="end">
                                                    <CalendarTodayIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: '#666', fontSize: '0.9rem' }}>
                                Số lượng
                            </Typography>
                            <TextField
                                name="quantity"
                                type="number"
                                fullWidth
                                value={formData.quantity}
                                onChange={handleFormChange}
                                InputProps={{
                                    inputProps: { min: 0 },
                                    sx: {
                                        borderRadius: 1
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={handleCloseDialog}
                        color="inherit"
                        variant="outlined"
                        sx={{ minWidth: 100 }}
                    >
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
                            },
                            minWidth: 100
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