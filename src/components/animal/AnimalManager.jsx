import React, { useEffect, useState } from "react";
import { animalService } from "../../services/animalService";
import { pigPenService } from "../../services/pigPenService";
import "../styles/AnimalManager.css";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterAlt,
    FilterAltOff,
    Refresh,
    Pets
} from "@mui/icons-material";
import AnimalFormUpdate from "./AnimalFormUpdate.jsx";
import AnimalFormCreate from "./AnimalFormCreate.jsx";
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
    'ACTIVE': { label: 'Đang nuôi', color: 'success', class: 'status-active' },
    'SOLD': { label: 'Đã bán', color: 'info', class: 'status-sold' },
    'DEAD': { label: 'Đã chết', color: 'error', class: 'status-dead' },
    'TRANSFERRED': { label: 'Đã chuyển', color: 'warning', class: 'status-transferred' }
};

export default function AnimalManager() {
    // State variables
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPenId, setFilterPenId] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        animalId: null
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [pigPens, setPigPens] = useState([]);

    // Initialize and fetch data
    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);
        fetchAnimals();
        fetchPigPens();
    }, []);

    // Notification handlers
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    // Data fetching functions
    const fetchAnimals = async () => {
        setLoading(true);
        try {
            const data = await animalService.getAllAnimals();
            setAnimals(data);
            setFilteredAnimals(data);
        } catch (err) {
            console.error("Error fetching animals:", err);
            showNotification("Could not load animal data", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchPigPens = async () => {
        try {
            const pens = await pigPenService.getAllPigPens();
            setPigPens(pens);
        } catch (err) {
            console.error("Error fetching pig pens:", err);
        }
    };

    // Search and filter functions
    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            // Build search parameters
            const params = {};
            if (searchTerm) params.name = searchTerm;
            if (filterStatus) params.status = filterStatus;
            if (filterPenId) params.penId = filterPenId;
            if (dateRange.from) params.entryDateFrom = dateRange.from;
            if (dateRange.to) params.entryDateTo = dateRange.to;

            // If no filters, return all animals
            if (Object.keys(params).length === 0) {
                setFilteredAnimals(animals);
            } else {
                // Otherwise, search with parameters
                const searchResults = await animalService.searchAnimals(params);
                setFilteredAnimals(searchResults);

                if (searchResults.length === 0) {
                    showNotification("No matching animals found", "info");
                }
            }
        } catch (error) {
            console.error("Error searching animals:", error);
            showNotification("Error searching animals", "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handleFilterPenChange = (e) => {
        setFilterPenId(e.target.value);
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleAdvancedFilter = () => {
        setShowAdvancedFilter(!showAdvancedFilter);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setFilterPenId('');
        setDateRange({ from: '', to: '' });
        setFilteredAnimals(animals);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // CRUD operation handlers
    const handleDeleteClick = (id) => {
        setDeleteDialog({ open: true, animalId: id });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, animalId: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await animalService.deleteAnimal(deleteDialog.animalId);
            setAnimals((prev) => prev.filter((a) => a.pigId !== deleteDialog.animalId));
            setFilteredAnimals((prev) => prev.filter((a) => a.pigId !== deleteDialog.animalId));
            showNotification("Animal deleted successfully");
        } catch (err) {
            console.error("Error deleting animal:", err);
            showNotification("Error deleting animal", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    // Helper functions
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPenName = (penId) => {
        const pen = pigPens.find(p => p.penId === penId);
        return pen ? pen.name : "—";
    };

    // Prepare data for table
    const paginatedAnimals = filteredAnimals.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ py: 2 }}>
            {/* Title */}
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý cá thể vật nuôi</h1>
            </Stack>

            {/* Search and filter container */}
            <SearchContainer elevation={1} className="search-container">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên..."
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
                        <Tooltip title={showAdvancedFilter ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}>
                            <Button
                                variant="outlined"
                                startIcon={showAdvancedFilter ? <FilterAltOff /> : <FilterAlt />}
                                onClick={handleToggleAdvancedFilter}
                                size="small"
                                color="primary"
                                className="filter-button"
                            >
                                {showAdvancedFilter ? 'Ẩn bộ lọc' : 'Lọc nâng cao'}
                            </Button>
                        </Tooltip>
                        {(searchTerm || filterStatus || filterPenId || dateRange.from || dateRange.to) && (
                            <Button
                                variant="text"
                                color="error"
                                onClick={handleResetFilters}
                                size="small"
                                startIcon={<Refresh />}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Grid>

                    {/* Advanced filter panel */}
                    {showAdvancedFilter && (
                        <Grid container item xs={12} spacing={2} className="advanced-search-panel open">
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="filter-status-label">Trạng thái</InputLabel>
                                    <Select
                                        labelId="filter-status-label"
                                        value={filterStatus}
                                        label="Trạng thái"
                                        onChange={handleFilterStatusChange}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="ACTIVE">Đang nuôi</MenuItem>
                                        <MenuItem value="SOLD">Đã bán</MenuItem>
                                        <MenuItem value="DEAD">Đã chết</MenuItem>
                                        <MenuItem value="TRANSFERRED">Đã chuyển</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="filter-pen-label">Chuồng nuôi</InputLabel>
                                    <Select
                                        labelId="filter-pen-label"
                                        value={filterPenId}
                                        label="Chuồng nuôi"
                                        onChange={handleFilterPenChange}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {pigPens.map((pen) => (
                                            <MenuItem key={pen.penId} value={pen.penId}>
                                                {pen.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="from"
                                    label="Từ ngày"
                                    type="date"
                                    value={dateRange.from}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="to"
                                    label="Đến ngày"
                                    type="date"
                                    value={dateRange.to}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </SearchContainer>

            {/* Counter and add button */}
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tổng số cá thể: {filteredAnimals.length}
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => setOpenCreateForm(true)}
                        sx={{
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            backgroundColor: '#1E8449',
                            '&:hover': {
                                backgroundColor: '#155d32'
                            }
                        }}
                    >
                        Thêm cá thể mới
                    </Button>
                </div>
            </Typography>

            {/* Table with loading state */}
            <TableContainer component={Paper}
                            sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: 2, position: 'relative' }}
                            className="table-container">
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
                <Table sx={{ minWidth: 650 }} aria-label="animals table" className="animal-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Tên</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Chuồng nuôi</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày nhập</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày xuất</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Cân nặng (kg)</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Trạng thái</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Hành động</StyledTableHeaderCell>
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
                                    <StyledTableCell sx={{ fontWeight: 'medium' }}>{animal.name}</StyledTableCell>
                                    <StyledTableCell>{animal.pigPen ? animal.pigPen.name : "—"}</StyledTableCell>
                                    <StyledTableCell>{formatDate(animal.entryDate)}</StyledTableCell>
                                    <StyledTableCell>{formatDate(animal.exitDate) || "—"}</StyledTableCell>
                                    <StyledTableCell>{animal.weight ? animal.weight.toFixed(1) : "—"}</StyledTableCell>
                                    <StyledTableCell>
                                        <Box
                                            component="span"
                                            className={`status-badge ${statusMapping[animal.status]?.class || ''}`}
                                        >
                                            {statusMapping[animal.status]?.label || animal.status}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Sửa">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="warning"
                                                    onClick={() => {
                                                        setSelectedAnimal(animal);
                                                        setOpenUpdateForm(true);
                                                    }}
                                                    className="action-button"
                                                >
                                                    <Edit fontSize="small" />
                                                    <Box component="span"
                                                         sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>SỬA</Box>
                                                </ActionButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <ActionButton
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(animal.pigId)}
                                                    className="action-button"
                                                >
                                                    <Delete fontSize="small" />
                                                    <Box component="span"
                                                         sx={{ ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>XÓA</Box>
                                                </ActionButton>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
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

            {/* Dialogs */}
            <Dialog
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxWidth: '600px', borderRadius: '8px' } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Pets color="primary" />
                    <Typography variant="h6" component="div">Thêm cá thể mới</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <AnimalFormCreate
                        onClose={(success) => {
                            setOpenCreateForm(false);
                            if (success) {
                                showNotification("Thêm cá thể thành công");
                                fetchAnimals();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxWidth: '600px', borderRadius: '8px' } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Pets color="primary" />
                    <Typography variant="h6" component="div">Cập nhật thông tin cá thể</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <AnimalFormUpdate
                        animalData={selectedAnimal}
                        onClose={(success) => {
                            setOpenUpdateForm(false);
                            setSelectedAnimal(null);
                            if (success) {
                                showNotification("Cập nhật cá thể thành công");
                                fetchAnimals();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ sx: { borderRadius: '8px' } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa cá thể này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleDeleteCancel} color="primary" variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}