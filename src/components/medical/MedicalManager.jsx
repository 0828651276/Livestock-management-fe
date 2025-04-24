import React, { useEffect, useState } from "react";
import {
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    InputAdornment,
    Grid,
    TablePagination,
    Tooltip,
    CircularProgress,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterAlt,
    FilterAltOff,
    Refresh,
    LocalHospital,
    MedicalServices
} from "@mui/icons-material";
import medicalService from '../../services/medicalService';
import { styled } from '@mui/material/styles';

// Styled components
const ActionButton = styled(Button)(({ theme }) => ({
    minWidth: '32px',
    padding: '6px 12px',
    boxShadow: 'none',
    '&:hover': {
        boxShadow: theme.shadows[2]
    }
}));

const StyledTableCell = styled(TableCell)(() => ({
    padding: '12px 16px',
    fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[1],
    borderRadius: '8px'
}));

// Status mapping for display
const statusMapping = {
    SICK: { label: 'Bị bệnh', color: 'warning', class: 'status-sick' },
    UNVACCINATED: { label: 'Chưa tiêm phòng', color: 'error', class: 'status-unvaccinated' }
};

export default function MedicalManager() {
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [treatmentDialog, setTreatmentDialog] = useState({
        open: false,
        treatmentId: null,
        animal: null
    });
    const [treatmentForm, setTreatmentForm] = useState({
        pigId: '',
        treatmentType: '',
        veterinarian: '',
        medicine: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [treatments, setTreatments] = useState([]);
    const [activeTreatment, setActiveTreatment] = useState(null);

    useEffect(() => {
        fetchSickAnimals();
        fetchTreatments();
    }, []);

    const fetchSickAnimals = async () => {
        setLoading(true);
        try {
            const animals = await medicalService.getSickOrUnvaccinatedAnimals();
            setAnimals(animals);
            setFilteredAnimals(animals);
        } catch (error) {
            console.error("Error fetching sick animals:", error);
            showNotification("Không thể tải danh sách động vật bệnh", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchTreatments = async () => {
        try {
            const treatments = await medicalService.getAllTreatments();
            setTreatments(treatments);
        } catch (error) {
            console.error("Error fetching treatments:", error);
        }
    };

    const handleSearch = () => {
        setSearchLoading(true);
        try {
            if (searchTerm) {
                const filtered = animals.filter(animal =>
                    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    animal.pigId.toString().includes(searchTerm)
                );
                setFilteredAnimals(filtered);
                if (filtered.length === 0) {
                    showNotification("Không tìm thấy động vật phù hợp", "info");
                }
            } else {
                setFilteredAnimals(animals);
            }
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!e.target.value) {
            setFilteredAnimals(animals);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleTreatmentClick = (animal) => {
        // Find existing treatment for this animal
        const treatment = treatments.find(t => t.pigId === animal.pigId);

        setTreatmentForm({
            pigId: animal.pigId,
            penId: animal.penId || '',
            treatmentType: treatment?.treatmentType || '',
            veterinarian: treatment?.veterinarian || '',
            medicine: treatment?.medicine || '',
            note: treatment?.note || '',
            date: new Date().toISOString().split('T')[0]
        });

        setActiveTreatment(treatment);
        setTreatmentDialog({
            open: true,
            animal: animal
        });
    };

    const handleTreatmentDialogClose = () => {
        setTreatmentDialog({
            open: false,
            animal: null
        });
        setActiveTreatment(null);
    };

    const handleTreatmentFormChange = (e) => {
        const { name, value } = e.target;
        setTreatmentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTreatmentSubmit = async () => {
        try {
            let response;
            if (activeTreatment) {
                response = await medicalService.updateTreatment(activeTreatment.id, treatmentForm);
            } else {
                response = await medicalService.createTreatment(treatmentForm);
            }
            showNotification(activeTreatment ? "Cập nhật điều trị thành công" : "Thêm điều trị thành công", "success");
            fetchTreatments();
            handleTreatmentDialogClose();
        } catch (error) {
            console.error("Error saving treatment:", error);
            showNotification("Lỗi khi lưu thông tin điều trị", "error");
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Paginated data
    const paginatedAnimals = filteredAnimals.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ py: 2 }}>
            {/* Title */}
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý điều trị bệnh</h1>
            </Stack>

            {/* Search and filter container */}
            <SearchContainer elevation={1} className="search-container">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên hoặc mã động vật..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 1 }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                            onClick={handleSearch}
                            disabled={searchLoading}
                            sx={{ height: '40px' }}
                        >
                            Tìm kiếm
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchSickAnimals}
                            size="small"
                            color="primary"
                        >
                            Làm mới
                        </Button>
                    </Grid>
                </Grid>
            </SearchContainer>

            {/* Counter */}
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tổng số động vật cần điều trị: {filteredAnimals.length}
            </Typography>

            {/* Table with loading state */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: 2, position: 'relative' }}
                className="table-container"
            >
                {loading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 1
                    }}>
                        <CircularProgress />
                    </Box>
                )}
                <Table sx={{ minWidth: 650 }} aria-label="medical treatment table" className="animal-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Tên</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Trạng thái</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Cân nặng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Thao tác</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAnimals.length > 0 ? (
                            paginatedAnimals.map((animal, index) => (
                                <TableRow
                                    key={animal.pigId}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                        '&:hover': { backgroundColor: '#f0f7ff' }
                                    }}
                                >
                                    <StyledTableCell>{animal.pigId}</StyledTableCell>
                                    <StyledTableCell>{animal.name}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            label={statusMapping[animal.status]?.label || animal.status}
                                            color={statusMapping[animal.status]?.color || "default"}
                                            size="small"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>{animal.weight ? animal.weight.toFixed(1) + " kg" : "—"}</StyledTableCell>
                                    <StyledTableCell>{animal.quantity || "—"}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Quản lý điều trị">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleTreatmentClick(animal)}
                                                    className="action-button"
                                                >
                                                    <MedicalServices fontSize="small" />
                                                    <Box component="span" sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>
                                                        ĐIỀU TRỊ
                                                    </Box>
                                                </ActionButton>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu động vật cần điều trị
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredAnimals.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />

            {/* BẢNG LỊCH SỬ CHỮA TRỊ */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>Lịch sử chữa trị</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Tên động vật</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Loại điều trị</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Bác sĩ</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Thuốc</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Ngày</StyledTableHeaderCell>
                                <StyledTableHeaderCell>Ghi chú</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {treatments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                                </TableRow>
                            ) : (
                                treatments.map((treatment, idx) => (
                                    <TableRow key={treatment.id || idx}>
                                        <StyledTableCell>{treatment.id}</StyledTableCell>
                                        <StyledTableCell>{treatment.animalName || treatment.pigName || treatment.pigId}</StyledTableCell>
                                        <StyledTableCell>{treatment.treatmentType}</StyledTableCell>
                                        <StyledTableCell>{treatment.veterinarian}</StyledTableCell>
                                        <StyledTableCell>{treatment.medicine}</StyledTableCell>
                                        <StyledTableCell>{treatment.date}</StyledTableCell>
                                        <StyledTableCell>{treatment.note}</StyledTableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Treatment Dialog */}
            <Dialog
                open={treatmentDialog.open}
                onClose={handleTreatmentDialogClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalHospital color="primary" />
                        <Typography variant="h6">
                            Điều trị cho {treatmentDialog.animal?.name}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Loại điều trị"
                                    name="treatmentType"
                                    value={treatmentForm.treatmentType}
                                    onChange={handleTreatmentFormChange}
                                    fullWidth
                                    placeholder="Ví dụ: Tiêm kháng sinh, Điều trị cảm cúm..."
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Người điều trị"
                                    name="veterinarian"
                                    value={treatmentForm.veterinarian}
                                    onChange={handleTreatmentFormChange}
                                    fullWidth
                                    placeholder="Tên bác sĩ thú y hoặc người điều trị"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Thuốc sử dụng"
                                    name="medicine"
                                    value={treatmentForm.medicine}
                                    onChange={handleTreatmentFormChange}
                                    fullWidth
                                    placeholder="Các loại thuốc sử dụng"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Ngày điều trị"
                                    name="date"
                                    type="date"
                                    value={treatmentForm.date}
                                    onChange={handleTreatmentFormChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ghi chú"
                                    name="note"
                                    value={treatmentForm.note}
                                    onChange={handleTreatmentFormChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Thông tin thêm về tình trạng và điều trị"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTreatmentDialogClose} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleTreatmentSubmit}
                        variant="contained"
                        color="primary"
                        startIcon={<MedicalServices />}
                    >
                        {activeTreatment ? 'Cập nhật điều trị' : 'Lưu điều trị'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}