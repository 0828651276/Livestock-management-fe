import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert,
    Stack, TextField, MenuItem, Button
} from "@mui/material";
import { getFilteredTransactions } from "../../services/feedWarehouseService.js";
import {styled} from "@mui/material/styles";

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
            const data = await getFilteredTransactions({
                transactionType,
                startDate,
                endDate
            });
            setTransactions(data);
            setError(null);
        } catch (err) {
            setError("Không thể tải dữ liệu giao dịch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [feedType]);

    const handleFilter = () => {
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
                            <StyledTableHeaderCell align="center">Ngày giao dịch</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Loại giao dịch</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Số lượng (kg)</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Ghi chú</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions && transactions.length > 0 ? (
                            transactions.map((tran, idx) => (
                                <TableRow key={idx}>
                                    <StyledTableCell align="center">{tran.date}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {tran.transactionType === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{tran.quantity}</StyledTableCell>
                                    <StyledTableCell align="center">{tran.note || "-"}</StyledTableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <StyledTableCell colSpan={4} align="center">
                                    Không có giao dịch nào
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
