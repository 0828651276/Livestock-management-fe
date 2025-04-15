import React, {useEffect, useState} from "react";
import {pigPenService} from "../../services/pigPenService";
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
    Grid
} from "@mui/material";
import {Add, Edit, Delete, Search, ArrowBack} from "@mui/icons-material";
import PigPenFormUpdate from "./PenFormUpdate.jsx";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import {useNavigate} from "react-router-dom";
import PigPenFormCreate from "./PenFormCreate.jsx";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {parseISO, isAfter, isBefore, isEqual} from 'date-fns';
import {styled} from '@mui/material/styles';

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export default function PenManager() {
    const navigate = useNavigate();
    const [pigPens, setPigPens] = useState([]);
    const [filteredPigPens, setFilteredPigPens] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({startDate: '', endDate: ''});
    const [selectedPigPen, setSelectedPigPen] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({open: false, message: '', severity: 'success'});
    const [deleteDialog, setDeleteDialog] = useState({open: false, penId: null});

    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({open: true, message, severity});
    };

    useEffect(() => {
        fetchPigPens();
    }, []);

    useEffect(() => {
        let filtered = [...pigPens];

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(pen =>
                pen.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

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
    }, [searchTerm, dateRange, pigPens]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDateRangeChange = (e) => {
        const {name, value} = e.target;
        setDateRange(prev => ({...prev, [name]: value}));
    };

    const handleToggleDateFilter = () => {
        setShowDateFilter(!showDateFilter);
        if (showDateFilter) {
            setDateRange({startDate: '', endDate: ''});
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange({startDate: '', endDate: ''});
    };

    const fetchPigPens = async () => {
        try {
            const res = await pigPenService.getAllPigPens();
            setPigPens(res);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chuồng nuôi:", err);
            showNotification("Không thể tải danh sách chuồng nuôi", "error");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN");
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({open: true, penId: id});
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({open: false, penId: null});
    };

    const handleDeleteConfirm = async () => {
        try {
            await pigPenService.deletePigPen(deleteDialog.penId);
            setPigPens((prev) => prev.filter((p) => p.penId !== deleteDialog.penId));
            showNotification("Xóa chuồng nuôi thành công");
        } catch (err) {
            console.error("Lỗi khi xoá chuồng nuôi:", err);
            showNotification("Lỗi khi xóa chuồng nuôi", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    return (
        <Box sx={{p: 4}}>
            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="contained" color="primary">QUẢN LÝ VẬT NUÔI</Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setOpenCreateForm(true)}
                >
                    Thêm Chuồng
                </Button>
            </Stack>

            <StyledPaper sx={{mb: 3, p: 2}}>
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
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                        <Button variant="outlined" startIcon={<FilterAltIcon/>} onClick={handleToggleDateFilter}
                                sx={{mr: 1}}>
                            {showDateFilter ? 'Ẩn bộ lọc ngày' : 'Lọc theo ngày tạo'}
                        </Button>
                        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                            <Button variant="text" color="inherit" onClick={handleResetFilters}>
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
                                    InputLabelProps={{shrink: true}}
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
                                    InputLabelProps={{shrink: true}}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </StyledPaper>


            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="pigpen table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã chuồng</TableCell>
                            <TableCell>Tên chuồng</TableCell>
                            <TableCell>Người chăm sóc</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Ngày đóng</TableCell>
                            <TableCell>Số lượng</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPigPens.map((pen, index) => (
                            <TableRow key={pen.penId} sx={{backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff"}}>
                                <TableCell>{pen.penId}</TableCell>
                                <TableCell>{pen.name}</TableCell>
                                <TableCell>{pen.caretaker?.fullName || ""}</TableCell>
                                <TableCell>{formatDate(pen.createdDate)}</TableCell>
                                <TableCell>{formatDate(pen.closedDate)}</TableCell>
                                <TableCell>{pen.quantity}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" variant="outlined" color="warning" startIcon={<Edit/>}
                                                onClick={() => {
                                                    setSelectedPigPen(pen);
                                                    setOpenUpdateForm(true);
                                                }}>Sửa</Button>
                                        <Button size="small" variant="outlined" color="error" startIcon={<Delete/>}
                                                onClick={() => handleDeleteClick(pen.penId)}>Xoá</Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPigPens.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification}
                      anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled"
                       sx={{width: '100%'}}>
                    {notification.message}
                </Alert>
            </Snackbar>

            <Dialog open={openCreateForm} onClose={() => setOpenCreateForm(false)} maxWidth="md" fullWidth
                    PaperProps={{sx: {maxWidth: '600px'}}}>
                <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <AddHomeWorkIcon/> Thêm chuồng nuôi
                </DialogTitle>
                <DialogContent sx={{p: 0}}>
                    <PigPenFormCreate onClose={(success) => {
                        setOpenCreateForm(false);
                        if (success) {
                            showNotification("Thêm chuồng nuôi thành công");
                            fetchPigPens();
                        }
                    }}/>
                </DialogContent>
            </Dialog>

            <Dialog open={openUpdateForm} onClose={() => setOpenUpdateForm(false)} maxWidth="md" fullWidth
                    PaperProps={{sx: {maxWidth: '600px'}}}>
                <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <AddHomeWorkIcon/> Cập nhật chuồng nuôi
                </DialogTitle>
                <DialogContent sx={{p: 0}}>
                    <PigPenFormUpdate pigPenData={selectedPigPen} onClose={(success) => {
                        setOpenUpdateForm(false);
                        setSelectedPigPen(null);
                        if (success) {
                            showNotification("Cập nhật chuồng nuôi thành công");
                            fetchPigPens();
                        }
                    }}/>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">Bạn có chắc chắn muốn xóa chuồng nuôi này
                        không?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">Hủy</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}