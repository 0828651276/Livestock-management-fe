import React, { useEffect, useState } from 'react';
import { getDailyFeedSummary } from '../../services/feedPlanService';
import {
    Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography,
    CircularProgress, Alert, Box, IconButton
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FeedSummaryTable = () => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDailyFeedSummary();
                setSummaries(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching feed summary:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (pigPenId, feedType) => {
        navigate(`/feedplan/feedplanupdate?pigPenId=${pigPenId}&feedType=${feedType}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (summaries.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Không có dữ liệu khẩu phần ăn nào được tìm thấy.
            </Alert>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ backgroundColor: '#f5f5f5', px: 2, py: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Typography variant="h6" align="center" fontWeight="bold">
                    Bảng tổng hợp khẩu phần ăn hàng ngày
                </Typography>
            </Box>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#eeeeee' }}>
                        <TableCell><strong>Chuồng nuôi</strong></TableCell>
                        <TableCell><strong>Loại thức ăn</strong></TableCell>
                        <TableCell align="right"><strong>Tổng lượng thức ăn (kg)</strong></TableCell>
                        <TableCell align="center"><strong>Thao tác</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {summaries.map((item) => (
                        <TableRow key={`${item.pigPenId}-${item.feedType}`}>
                            <TableCell>{item.penName}</TableCell>
                            <TableCell>{item.feedType}</TableCell>
                            <TableCell align="right">{item.totalDailyFood}</TableCell>
                            <TableCell align="center">
                                <IconButton 
                                    onClick={() => handleEdit(item.pigPenId, item.feedType)}
                                    color="primary"
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default FeedSummaryTable;
