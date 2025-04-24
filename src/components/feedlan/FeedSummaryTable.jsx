import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer,
    Typography, CircularProgress, Alert, Box, IconButton, TextField, Button,
    Stack, Snackbar, Dialog, DialogTitle, DialogContent, InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Add, Search } from '@mui/icons-material';
import { getDailyFeedSummary, searchByPenName } from '../../services/feedPlanService';
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

    // Lấy role từ localStorage
    useEffect(() => {
        setUserRole(localStorage.getItem('role') || '');
    }, []);

    // Hàm load dữ liệu
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getDailyFeedSummary();
            setSummaries(data);
            setFilteredSummaries(data);
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

    // Tìm kiếm theo tên chuồng
    const handleSearch = async (value) => {
        const keyword = value.trim();
        if (!keyword) {
            setFilteredSummaries(summaries);
            return;
        }

        try {
            const data = await searchByPenName(keyword);
            const result = data.map(plan => ({
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
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setOpenEditForm(true);
    };

    const handleSuccess = (message) => {
        fetchData();
        setNotification({ open: true, message, severity: 'success' });
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
                        }}                    >
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
                            filteredSummaries.map(item => (
                                <TableRow key={`${item.pigPenId}-${item.feedType}`}>
                                    <StyledTableCell>{item.penName}</StyledTableCell>
                                    <StyledTableCell>{item.feedType}</StyledTableCell>
                                    <StyledTableCell>{item.totalDailyFood}</StyledTableCell>
                                    <StyledTableCell>
                                        {userRole === 'MANAGER' && (
                                            <IconButton
                                                onClick={() => handleEdit(item)}
                                                color="primary"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Form thêm mới */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
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
            <Dialog open={openEditForm} onClose={() => setOpenEditForm(false)} maxWidth="md" fullWidth>
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

            {/* Thông báo snackbar */}
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
