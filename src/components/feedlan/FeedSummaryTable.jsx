import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer,
    Typography, CircularProgress, Alert, Box, IconButton, TextField, Button,
    Stack, Snackbar, Dialog, DialogTitle, DialogContent, InputAdornment,
    TablePagination
} from '@mui/material';
import { Edit as EditIcon, Add, Search, Delete } from '@mui/icons-material';
import { getDailyFeedSummary, searchByPenName, feedPlanService } from '../../services/feedPlanService';
import FeedPlanForm from "./FeedPlanForm.jsx";
import FeedPlanEditForm from "./FeedPlanEditForm.jsx";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(() => ({
    padding: '12px 16px',
    fontSize: '0.875rem',
    textAlign: 'center'
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    textAlign: 'center'
}));

const FeedSummaryTable = () => {
    const [summaries, setSummaries] = useState([]);
    const [filteredSummaries, setFilteredSummaries] = useState([]);
    const [penName, setPenName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openForm, setOpenForm] = useState(false);
    const [openEditForm, setOpenEditForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [userRole, setUserRole] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, feedPlanId: null });

    // Phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setUserRole(localStorage.getItem('role') || '');
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getDailyFeedSummary();
            // Normalize data to always have an 'id' field
            const normalized = data.map(plan => ({
                ...plan,
                id: plan.feedPlanId,
            }));
            setSummaries(normalized);
            setFilteredSummaries(normalized);
            setError(null);
        } catch (err) {
            console.error('Error fetching feed summary:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = async (value) => {
        const keyword = value.trim();
        if (!keyword) {
            setFilteredSummaries(summaries);
            return;
        }

        try {
            const data = await searchByPenName(keyword);
            const result = data.map(plan => ({
                id: plan.feedPlanId,
                pigPenId: plan.pigPen?.id,
                penName: plan.pigPen?.name,
                feedType: plan.feedType,
                totalDailyFood: plan.dailyFood,
            }));
            setFilteredSummaries(result);
        } catch (err) {
            console.error('Lỗi khi tìm kiếm:', err);
            setError('Không thể tìm kiếm. Vui lòng thử lại sau.');
        }
    };

    const handlePenNameChange = (e) => {
        const value = e.target.value;
        setPenName(value);
        handleSearch(value);
        setPage(0); // reset về trang đầu khi tìm kiếm
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setOpenEditForm(true);
    };

    const handleSuccess = (message) => {
        fetchData();
        setNotification({ open: true, message, severity: 'success' });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (item) => {
        setDeleteDialog({ open: true, feedPlanId: item.id });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, feedPlanId: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await feedPlanService.deleteFeedPlan(deleteDialog.feedPlanId);
            setNotification({ open: true, message: 'Xóa khẩu phần ăn thành công!', severity: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ open: true, message: 'Xóa khẩu phần ăn thất bại!', severity: 'error' });
        } finally {
            handleDeleteCancel();
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Bảng tổng hợp khẩu phần ăn hàng ngày</Typography>

            {/* Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Tên chuồng"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={penName}
                        onChange={handlePenNameChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Search />}
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

            {/* Button thêm mới */}
            {userRole === 'MANAGER' && (
                <Box mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => setOpenForm(true)}
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                        Thêm mới
                    </Button>
                </Box>
            )}

            {/* Bảng dữ liệu */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Chuồng nuôi</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Loại thức ăn</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Tổng lượng thức ăn (kg)</StyledTableHeaderCell>
                            <StyledTableHeaderCell>{userRole === 'MANAGER' ? 'Thao tác' : ''}</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSummaries.length === 0 ? (
                            <TableRow>
                                <StyledTableCell colSpan={4}>
                                    <Alert severity="info">
                                        {penName.trim()
                                            ? 'Không tìm thấy kết quả phù hợp.'
                                            : 'Không có dữ liệu khẩu phần ăn nào được tìm thấy.'}
                                    </Alert>
                                </StyledTableCell>
                            </TableRow>
                        ) : (
                            filteredSummaries
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(item => (
                                    <TableRow key={`${item.pigPenId}-${item.feedType}`}>
                                        <StyledTableCell>{item.penName}</StyledTableCell>
                                        <StyledTableCell>{item.feedType}</StyledTableCell>
                                        <StyledTableCell>{item.totalDailyFood}</StyledTableCell>
                                        <StyledTableCell>
                                            {userRole === 'MANAGER' && (
                                                <>
                                                    <IconButton
                                                        onClick={() => handleEdit(item)}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    {/*<IconButton*/}
                                                    {/*    onClick={() => handleDeleteClick(item)}*/}
                                                    {/*    color="error"*/}
                                                    {/*    size="small"*/}
                                                    {/*>*/}
                                                    {/*    <Delete />*/}
                                                    {/*</IconButton>*/}
                                                </>
                                            )}
                                        </StyledTableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredSummaries.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Form thêm mới */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle textAlign="center">Thêm khẩu phần ăn mới</DialogTitle>
                <DialogContent>
                    <FeedPlanForm
                        onClose={() => setOpenForm(false)}
                        onSuccess={() => {
                            setOpenForm(false);
                            handleSuccess("Thêm khẩu phần ăn thành công!");
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Form cập nhật */}
            <Dialog open={openEditForm} onClose={() => setOpenEditForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle textAlign="center">Cập nhật khẩu phần ăn</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <FeedPlanEditForm
                            initialData={selectedItem}
                            onClose={() => setOpenEditForm(false)}
                            onSuccess={() => {
                                setOpenEditForm(false);
                                handleSuccess("Cập nhật khẩu phần ăn thành công!");
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
                <DialogTitle>Xác nhận xóa khẩu phần ăn</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa khẩu phần ăn này không?</Typography>
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                        <Button onClick={handleDeleteCancel} color="primary" variant="outlined">Hủy</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Xóa</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeedSummaryTable;
