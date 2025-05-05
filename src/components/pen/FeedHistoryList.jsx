import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    TablePagination
} from '@mui/material';
import { feedHistoryService } from '../../services/feedHistoryService';

const FeedHistoryList = ({ penId }) => {
    const [feedHistory, setFeedHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedHistory();
    }, [penId]);

    const fetchFeedHistory = async () => {
        try {
            setLoading(true);
            const response = await feedHistoryService.getFeedHistoryByPenId(penId);
            console.log('Feed history response:', response);
            // Sắp xếp theo thời gian mới nhất
            const sortedHistory = response.sort((a, b) => 
                new Date(b.feedingTime) - new Date(a.feedingTime)
            );
            setFeedHistory(sortedHistory);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi lấy lịch sử cho ăn:", err);
            setError("Không thể tải lịch sử cho ăn");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('vi-VN');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - feedHistory.length) : 0;

    return (
        <Box sx={{ width: '100%' }}>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Thời gian cho ăn</TableCell>
                            <TableCell>Loại thức ăn</TableCell>
                            <TableCell align="right">Số lượng (kg)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {feedHistory
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((history) => (
                                <TableRow key={history.id}>
                                    <TableCell>{formatDateTime(history.feedingTime)}</TableCell>
                                    <TableCell>
                                        {history.feedPlan?.feedType || 
                                         history.feedType || 
                                         'Không có thông tin'}
                                    </TableCell>
                                    <TableCell align="right">{history.dailyFood}</TableCell>
                                </TableRow>
                            ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={3} />
                            </TableRow>
                        )}
                        {feedHistory.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    Không có dữ liệu lịch sử cho ăn
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={feedHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
        </Box>
    );
};

export default FeedHistoryList; 