import React, { useEffect, useState, useCallback } from "react";
import {
    fetchFeedInventory,
    searchFeedInventory
} from "../../services/feedWarehouseService.js";
import {
    Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Stack, Box, Typography, Snackbar,
    Alert, InputAdornment, Dialog, DialogTitle, DialogContent, TablePagination
} from "@mui/material";
import { Search, Upload, Download } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import ImportFeedForm from "./ImportFeedForm.jsx";
import ExportFeedForm from "./ExportFeedForm.jsx";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";

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
    const [userRole, setUserRole] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const role = authService.getRole();
        setUserRole(role);
    }, []);

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
            setPage(0); // reset về trang đầu khi tìm kiếm
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

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            handleSearch(value);
        }, 500);

        setSearchTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = filteredInventory.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            {userRole === 'MANAGER' && (
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
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Loại thức ăn</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng còn</StyledTableHeaderCell>
                            {userRole === 'MANAGER' && (
                                <StyledTableHeaderCell>Hành động</StyledTableHeaderCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <TableRow key={item.id || index}>
                                    <StyledTableCell>{item.feedType}</StyledTableCell>
                                    <StyledTableCell>{item.remainingQuantity} kg</StyledTableCell>
                                    {userRole === 'MANAGER' && (
                                        <StyledTableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                component={Link}
                                                to={`/dashboard/feed-inventory/${item.feedType}`}
                                            >
                                                Chi tiết
                                            </Button>
                                        </StyledTableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <StyledTableCell colSpan={3} align="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredInventory.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
            />

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
                maxWidth="sm"
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
                maxWidth="sm"
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
