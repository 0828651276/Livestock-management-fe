import React, {useEffect, useState} from "react";
import {animalService} from "../../services/animalService";
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
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    InputAdornment,
    TablePagination,
    Tooltip,
    CircularProgress,
    Chip
} from "@mui/material";
import {
    Search,
    Delete,
    Edit,
    FilterAlt,
    FilterAltOff,
    Refresh
} from "@mui/icons-material";
import {styled} from '@mui/material/styles';
import ExportedAnimalFormUpdate from "./ExportedAnimalFormUpdate";

// Status mapping for display
const statusMapping = {
    EXPORTED: {label: 'Đã xuất chuồng', color: 'default', class: 'status-exported'}
};

const StyledTableCell = styled(TableCell)(() => ({
    padding: '12px 16px',
    fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(TableCell)(({theme}) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
}));

export default function ExportedAnimalManager() {
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        animalId: null
    });
    const [updateDialog, setUpdateDialog] = useState({
        open: false,
        animal: null
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchExportedAnimals();
    }, []);

    const fetchExportedAnimals = async () => {
        setLoading(true);
        try {
            const data = await animalService.getExportedAnimals();
            setAnimals(data);
            setFilteredAnimals(data);
        } catch (error) {
            console.error("Error fetching exported animals:", error);
            showNotification("Không thể tải danh sách động vật đã xuất", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSearchLoading(true);
        try {
            const filtered = animals.filter(animal =>
                animal.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAnimals(filtered);

            if (filtered.length === 0) {
                showNotification("Không tìm thấy kết quả", "info");
            }
        } catch (error) {
            console.error("Error searching animals:", error);
            showNotification("Lỗi tìm kiếm", "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilteredAnimals(animals);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({open: true, animalId: id});
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({open: false, animalId: null});
    };

    const handleDeleteConfirm = async () => {
        try {
            await animalService.deleteAnimal(deleteDialog.animalId);
            setAnimals((prev) => prev.filter((a) => a.pigId !== deleteDialog.animalId));
            setFilteredAnimals((prev) => prev.filter((a) => a.pigId !== deleteDialog.animalId));
            showNotification("Xóa cá thể đã xuất thành công");
        } catch (err) {
            console.error("Lỗi khi xóa cá thể:", err);
            showNotification("Lỗi khi xóa cá thể", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    // Thêm hàm mở form cập nhật
    const handleUpdateClick = (animal) => {
        setUpdateDialog({
            open: true,
            animal: animal
        });
    };

    // Hàm đóng form cập nhật
    const handleUpdateDialogClose = (success) => {
        setUpdateDialog({
            open: false,
            animal: null
        });

        if (success) {
            showNotification("Cập nhật cá thể đã xuất thành công");
            fetchExportedAnimals();
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
        setNotification({...notification, open: false});
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const paginatedAnimals = filteredAnimals.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{py: 2}}>
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý cá thể đã xuất chuồng</h1>
            </Stack>

            {/* Search container */}
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                }}
            >
                <Stack
                    direction={{xs: 'column', sm: 'row'}}
                    spacing={2}
                    alignItems={{xs: 'stretch', sm: 'center'}}
                >
                    <TextField
                        label="Tìm theo tên"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        sx={{flexGrow: 1}}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action"/>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={searchLoading ? <CircularProgress size={20} color="inherit"/> : <Search/>}
                        onClick={handleSearch}
                        disabled={searchLoading}
                        sx={{
                            flexShrink: 0,
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            {/* Counter */}
            <Typography variant="h6" component="h2" sx={{mb: 2, fontWeight: 'bold'}}>
                Tổng số cá thể đã xuất: {filteredAnimals.length}
            </Typography>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 2,
                    mb: 2
                }}
            >
                <Table sx={{minWidth: 650}} aria-label="exported animals table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>ID</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Tên</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày nhập</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày xuất</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Cân nặng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng</StyledTableHeaderCell>
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
                                        '&:hover': {backgroundColor: '#f0f7ff'}
                                    }}
                                >
                                    <StyledTableCell>{animal.pigId}</StyledTableCell>
                                    <StyledTableCell>{animal.name}</StyledTableCell>
                                    <StyledTableCell>{formatDate(animal.entryDate)}</StyledTableCell>
                                    <StyledTableCell>{formatDate(animal.exitDate)}</StyledTableCell>
                                    <StyledTableCell>{animal.weight ? animal.weight.toFixed(1) : "—"}</StyledTableCell>
                                    <StyledTableCell>{animal.quantity || "—"}</StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            label={statusMapping.EXPORTED.label}
                                            color="default"
                                            size="small"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Sửa">
                                                <Button
                                                    variant="contained"
                                                    color="warning"
                                                    size="small"
                                                    startIcon={<Edit/>}
                                                    onClick={() => handleUpdateClick(animal)}
                                                >
                                                    Sửa
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<Delete/>}
                                                    onClick={() => handleDeleteClick(animal.pigId)}
                                                >
                                                    Xóa
                                                </Button>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <StyledTableCell colSpan={8} align="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                                </StyledTableCell>
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
                labelDisplayedRows={({from, to, count}) => `${from}-${to} của ${count}`}
            />

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa cá thể đã xuất này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Dialog */}
            <Dialog
                open={updateDialog.open}
                onClose={() => handleUpdateDialogClose(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{sx: {maxWidth: '600px', borderRadius: '8px'}}}>
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}><Edit color="primary"/>
                    <Typography variant="h6" component="div">Cập nhật thông tin cá thể</Typography>
                    <DialogContent sx={{p: 0}}>
                        <ExportedAnimalFormUpdate
                            animalData={updateDialog.animal}
                            onClose={handleUpdateDialogClose}/>
                    </DialogContent>
                </DialogTitle>
            </Dialog>
        </Box>
    );
};
