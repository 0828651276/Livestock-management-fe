import React, { useEffect, useState, useCallback } from "react";
import { fetchFeedInventory, searchFeedInventory } from "../../services/feedWarehouseService.js";
import {
    Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Stack, Box, Typography, Snackbar,
    Alert, InputAdornment, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import { Search, Upload, Download } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import ImportFeedForm from "./ImportFeedForm.jsx";
import ExportFeedForm from "./ExportFeedForm.jsx";

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

export default function FeedInventoryManager() {
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [openImportForm, setOpenImportForm] = useState(false);
    const [openExportForm, setOpenExportForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchInventory = async () => {
        try {
            const data = await fetchFeedInventory();
            setInventory(data);
            setFilteredInventory(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách tồn kho:", err);
            setNotification({
                open: true,
                message: "Không thể tải danh sách tồn kho",
                severity: "error"
            });
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSearch = useCallback(async (keyword) => {
        try {
            if (keyword.trim() === '') {
                await fetchInventory();
            } else {
                const searchResults = await searchFeedInventory(keyword);
                setFilteredInventory(searchResults);
            }
        } catch (err) {
            console.error("Lỗi khi tìm kiếm:", err);
            setNotification({
                open: true,
                message: "Không thể tìm kiếm thức ăn",
                severity: "error"
            });
        }
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchKeyword(value);

        // Xóa timeout cũ nếu có
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Tạo timeout mới
        const timeout = setTimeout(() => {
            handleSearch(value);
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

        setSearchTimeout(timeout);
    };

    // Cleanup timeout khi component unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return (
        <Box sx={{ py: 2 }}>
            <Stack direction="row" spacing={2} mb={3}>
               <h1>Quản lý tồn kho thức ăn</h1>
            </Stack>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Tìm kiếm theo loại thức ăn"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={searchKeyword}
                        onChange={handleSearchChange}
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

            <Box textAlign="center" mb={2}>
                <Stack direction="row" spacing={2} justifyContent="row">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Upload />}
                        onClick={() => setOpenImportForm(true)}
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                        Nhập kho
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Download />}
                        onClick={() => setOpenExportForm(true)}
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                        Xuất kho
                    </Button>
                </Stack>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="feed inventory table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Loại thức ăn</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng còn</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item, index) => (
                                <TableRow key={item.id || index}>
                                    <StyledTableCell>{item.feedType}</StyledTableCell>
                                    <StyledTableCell>{item.remainingQuantity} kg</StyledTableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <StyledTableCell colSpan={2} align="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={openImportForm}
                onClose={() => setOpenImportForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle textAlign="center">Nhập kho thức ăn</DialogTitle>
                <DialogContent>
                    <ImportFeedForm
                        onClose={() => setOpenImportForm(false)}
                        onSuccess={() => {
                            setOpenImportForm(false);
                            fetchInventory();
                            setNotification({
                                open: true,
                                message: "Nhập kho thành công!",
                                severity: "success"
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={openExportForm}
                onClose={() => setOpenExportForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle textAlign="center">Xuất kho thức ăn</DialogTitle>
                <DialogContent>
                    <ExportFeedForm
                        onClose={() => setOpenExportForm(false)}
                        onSuccess={() => {
                            setOpenExportForm(false);
                            fetchInventory();
                            setNotification({
                                open: true,
                                message: "Xuất kho thành công!",
                                severity: "success"
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
