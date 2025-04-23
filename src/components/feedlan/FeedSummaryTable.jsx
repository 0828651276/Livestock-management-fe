import React, { useEffect, useState } from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer,
    Typography, CircularProgress, Alert, Box, IconButton, TextField, Button
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as feedPlanService from '../../services/feedPlanService.js';
import { getDailyFeedSummary } from '../../services/feedPlanService';

const FeedSummaryTable = () => {
    const [summaries, setSummaries] = useState([]);
    const [filteredSummaries, setFilteredSummaries] = useState([]);
    const [penName, setPenName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDailyFeedSummary();
                setSummaries(data);
                setFilteredSummaries(data); // Mặc định hiển thị tất cả
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

    const handleSearch = async () => {
        if (!penName.trim()) {
            try {
                const data = await getDailyFeedSummary();
                setSummaries(data);
                setFilteredSummaries(data);
            } catch (err) {
                console.error('Error fetching feed summary:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            }
            return;
        }

        try {
            const data = await feedPlanService.searchByPenName(penName);
            const result = data.map(plan => ({
                pigPenId: plan.pigPen?.id,
                penName: plan.pigPen?.name,
                feedType: plan.feedType,
                totalDailyFood: plan.dailyFood,
            }));
            setFilteredSummaries(result);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            setError('Không thể tìm kiếm. Vui lòng thử lại sau.');
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
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{ backgroundColor: '#f5f5f5', px: 2, py: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Typography variant="h6" align="center" fontWeight="bold">
                    Bảng tổng hợp khẩu phần ăn hàng ngày
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, px: 2, py: 2 }}>
                <TextField
                    label="Tên chuồng"
                    variant="outlined"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    fullWidth
                    placeholder="Nhập tên chuồng cần tìm"
                />
                <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    sx={{ minWidth: '120px' }}
                >
                    Tìm kiếm
                </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
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
                        {filteredSummaries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Alert severity="info">
                                        {penName.trim() 
                                            ? `Không tìm thấy chuồng nào có tên chứa "${penName}"`
                                            : 'Không có dữ liệu khẩu phần ăn nào được tìm thấy.'}
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSummaries.map((item) => (
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default FeedSummaryTable;
