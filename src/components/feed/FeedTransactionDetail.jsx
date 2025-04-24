import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert,
    Stack, TextField, MenuItem, Button
} from "@mui/material";
import { getFilteredTransactions } from "../../services/feedWarehouseService.js";

export default function FeedTransactionDetail() {
    const { feedType } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactionType, setTransactionType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadTransactions = async () => {
        setLoading(true);
        try {
            console.log("Đang tải dữ liệu với các tham số:", {
                feedType,
                transactionType,
                startDate,
                endDate
            });
            
            const data = await getFilteredTransactions({
                feedType,
                transactionType,
                startDate,
                endDate
            });
            
            console.log("Dữ liệu nhận được:", data);
            setTransactions(data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            setError("Không thể tải dữ liệu giao dịch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [feedType]);

    const handleFilter = () => {
        console.log("Áp dụng bộ lọc:", {
            feedType,
            transactionType,
            startDate,
            endDate
        });
        loadTransactions();
    };

    if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom textAlign="center">
                Chi tiết xuất nhập - {feedType}
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
                    <TextField
                        label="Từ ngày"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{ minWidth: 200 }}
                        fullWidth
                    />
                    <TextField
                        label="Đến ngày"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        sx={{ minWidth: 200 }}
                        fullWidth
                    />
                    <TextField
                        label="Loại giao dịch"
                        select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        sx={{ minWidth: 160 }}
                        fullWidth
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="IMPORT">Nhập</MenuItem>
                        <MenuItem value="EXPORT">Xuất</MenuItem>
                    </TextField>
                    <Button 
                        variant="contained" 
                        onClick={handleFilter}
                        sx={{ minWidth: 100 }}
                    >
                        Lọc
                    </Button>
                </Stack>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Ngày giao dịch</TableCell>
                            <TableCell align="center">Loại giao dịch</TableCell>
                            <TableCell align="center">Số lượng (kg)</TableCell>
                            <TableCell align="center">Ghi chú</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions && transactions.length > 0 ? (
                            transactions.map((tran, idx) => (
                                <TableRow key={idx}>
                                    <TableCell align="center">{tran.date}</TableCell>
                                    <TableCell align="center">
                                        {tran.transactionType === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                                    </TableCell>
                                    <TableCell align="center">{tran.quantity}</TableCell>
                                    <TableCell align="center">{tran.note || "-"}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    Không có giao dịch nào
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
