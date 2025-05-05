import React, { useEffect, useState } from "react";
import { pigPenService } from "../../services/pigPenService";
import { animalService } from "../../services/animalService";
import { getFilteredTransactions } from "../../services/feedWarehouseService";
import { feedPlanService } from "../../services/feedPlanService";
import "../styles/PenManager.css";
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
    Grid,
    TablePagination,
    Tooltip,
    CircularProgress,
    Chip
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterAlt,
    FilterAltOff,
    Refresh,
    ExitToApp,
    RestaurantOutlined
} from "@mui/icons-material";
import PigPenFormUpdate from "./PenFormUpdate.jsx";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import { useNavigate } from "react-router-dom";
import PigPenFormCreate from "./PenFormCreate.jsx";
import CaretakersList from "./CaretakersList.jsx";
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HistoryIcon from '@mui/icons-material/History';
import { feedHistoryService } from '../../services/feedHistoryService';

// Styled components
const ActionButton = styled(Button)(({ theme }) => ({
    minWidth: '32px',
    padding: '6px 12px',
    boxShadow: 'none',
    '&:hover': {
        boxShadow: theme.shadows[2]
    }
}));

const StyledTableCell = styled(TableCell)(() => ({
    padding: '12px 16px',
    fontSize: '0.875rem',
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[1],
    borderRadius: '8px'
}));

// AnimalNamesList component to display animal names
const AnimalNamesList = ({ penId }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                const data = await animalService.getByPenId(penId);
                // Filter only animals that are currently being raised (RAISING)
                const activeAnimals = data.filter(animal => animal.raisingStatus === "RAISING");
                setAnimals(activeAnimals);
            } catch (error) {
                console.error("Error fetching animals for pen:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, [penId]);

    if (loading) {
        return <CircularProgress size={20} />;
    }

    if (animals.length === 0) {
        return <Typography variant="body2" color="text.secondary">Không có</Typography>;
    }

    // Display animal names without delete button
    return (
        <Box>
            {animals.slice(0, 3).map((animal) => (
                <Typography key={animal.pigId} variant="body2" sx={{ mb: 0.5 }}>
                    • {animal.name}
                </Typography>
            ))}
            {animals.length > 3 && (
                <Typography variant="body2" color="text.secondary">
                    và {animals.length - 3} con khác
                </Typography>
            )}
        </Box>
    );
};

export default function PenManager() {
    const [pigPens, setPigPens] = useState([]);
    const [filteredPigPens, setFilteredPigPens] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({startDate: '', endDate: ''});
    const [selectedPigPen, setSelectedPigPen] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        penId: null
    });
    const [leaveDialog, setLeaveDialog] = useState({
        open: false,
        penId: null,
        penName: ''
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    // Lấy role và chuẩn hóa về chữ thường
    const [userRole, setUserRole] = useState(() => {
        const role = localStorage.getItem('role') || '';
        return role.toLowerCase();
    });
    const [employeeId, setEmployeeId] = useState('');
    // State cho menu thao tác từng pen
    const [actionMenu, setActionMenu] = useState({anchorEl: null, pen: null});
    // State for feed data
    const [feedExports, setFeedExports] = useState({});
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedingInProgress, setFeedingInProgress] = useState(false);

    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleAutoFeed = async (pen) => {
        if (!pen || feedingInProgress) return;
        
        setFeedingInProgress(true);
        try {
            // Lấy thông tin khẩu phần ăn hàng ngày của chuồng
            const feedPlans = await feedPlanService.getPenDailyFeedPlan(pen.penId);
            
            if (!feedPlans || !Array.isArray(feedPlans) || feedPlans.length === 0) {
                showNotification("Không tìm thấy khẩu phần ăn cho chuồng này", "error");
                return;
            }
            
            // Tạo lịch sử cho ăn với feed plan đầu tiên
            const feedPlan = feedPlans[0];
            
            // Kiểm tra dữ liệu feed plan
            if (!feedPlan.id) {
                showNotification("Khẩu phần ăn không hợp lệ", "error");
                return;
            }

            const currentTime = new Date();
            const employeeId = localStorage.getItem('employeeId');

            // Đảm bảo các giá trị là số và ngày giờ đúng định dạng
            const feedHistoryData = {
                pigPenId: parseInt(pen.penId),
                feedPlanId: parseInt(feedPlan.id),
                feedingTime: currentTime.toISOString().replace('Z', ''),  // Loại bỏ 'Z' để tránh timezone offset
                dailyFood: parseInt(feedPlan.dailyFood || 0),
                createdById: parseInt(employeeId)
            };

            // Log dữ liệu trước khi gửi
            console.log("Sending feed history data:", feedHistoryData);
            
            const response = await feedHistoryService.createFeedHistory(feedHistoryData);
            console.log("Feed history response:", response);
            
            showNotification("Đã cho ăn thành công!");
            
        } catch (error) {
            console.error("Lỗi khi tự động cho ăn:", error);
            let errorMessage = "Có lỗi xảy ra khi cho ăn";
            
            if (error.response) {
                // Lỗi từ backend
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
                console.error("Backend error details:", error.response.data);
            }
            
            showNotification(errorMessage, "error");
        } finally {
            setFeedingInProgress(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('employeeId');
        setUserRole(role.toLowerCase());
        setEmployeeId(id);

        // Gọi hàm fetch dữ liệu
        fetchPigPens(role.toLowerCase(), id);
        fetchFeedData();
    }, []);

    const fetchPigPens = async (role, id) => {
        setLoading(true);
        try {
            let res;
            // Nếu là MANAGER, lấy tất cả chuồng
            if (role === 'manager') {
                res = await pigPenService.getAllPigPens();
            }
            // Nếu là STAFF, chỉ lấy chuồng mà nhân viên đó chăm sóc
            else {
                res = await pigPenService.findByEmployeeId(id);
            }

            // Xử lý dữ liệu người chăm sóc
            const processedPens = res.map(pen => ({
                ...pen,
                caretakers: pen.caretakers || (pen.caretaker ? [pen.caretaker] : [])
            }));

            setPigPens(processedPens);
            setFilteredPigPens(processedPens);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chuồng nuôi:", err);
            showNotification("Không thể tải danh sách chuồng nuôi", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch feed export data for all pens
    const fetchFeedData = async () => {
        setFeedLoading(true);
        try {
            // Get all feed export transactions
            const transactions = await getFilteredTransactions({});

            // Organize feed exports by pen
            const feedByPen = {};

            // Log all transactions to inspect the structure
            console.log("All transactions:", transactions);

            transactions.forEach(transaction => {
                // Only process EXPORT transactions
                if (transaction.transactionType !== "EXPORT") return;

                // Check for the chuồng field in various formats
                let penName = null;

                // Try different field names that might contain the pen reference
                if (transaction.chuồng) {
                    penName = transaction.chuồng;
                } else if (transaction.barn) {
                    penName = transaction.barn;
                } else if (transaction.barnName) {
                    penName = transaction.barnName;
                }

                // Check in the note field for pen references
                if (!penName && transaction.note) {
                    // Look for patterns like "Chuồng 1" in the note
                    const noteMatch = transaction.note.match(/Chuồng\s+(\d+)/i);
                    if (noteMatch) {
                        penName = `Chuồng ${noteMatch[1]}`;
                    } else if (transaction.note.includes("Chuồng")) {
                        // Just extract anything with "Chuồng" in it
                        penName = "Chuồng 1"; // Default to Chuồng 1 if we can't extract the number
                    }
                }

                // If we still don't have a pen name but have a reference to "Chuồng" in any field
                if (!penName) {
                    // As a last resort, check if any reference to "Chuồng 1" exists anywhere in the transaction
                    const transactionStr = JSON.stringify(transaction);
                    const generalMatch = transactionStr.match(/Chuồng\s*(\d+)/i);
                    if (generalMatch) {
                        penName = `Chuồng ${generalMatch[1]}`;
                    }
                }

                // If we found a pen name, add the exported amount
                if (penName) {
                    if (!feedByPen[penName]) {
                        feedByPen[penName] = 0;
                    }
                    feedByPen[penName] += transaction.quantity || 0;
                }
            });

            console.log("Feed exports by pen:", feedByPen);
            setFeedExports(feedByPen);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu xuất thức ăn:", err);
        } finally {
            setFeedLoading(false);
        }
    };

    // Helper function to get feed amount for a specific pen
    const getFeedAmountForPen = (pen) => {
        if (feedLoading) return <CircularProgress size={16}/>;

        // Try to find feed exports for this pen by name
        const exportAmount = feedExports[pen.name] || 0;

        // Return the formatted feed amount
        return `${exportAmount} kg`;
    };

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            // Nếu có lọc theo ngày
            if (dateRange.startDate || dateRange.endDate) {
                // Dựa trên vai trò để quyết định tìm tất cả hay chỉ tìm theo caretaker
                let res;
                if (userRole === 'manager') {
                    res = await pigPenService.searchByDateRange(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                } else {
                    // Đối với nhân viên, tìm theo date nhưng vẫn chỉ trong phạm vi chuồng họ chăm sóc
                    res = await pigPenService.searchByDateRangeAndCaretaker(
                        dateRange.startDate,
                        dateRange.endDate,
                        employeeId
                    );
                }

                // Lọc thêm theo tên nếu có
                let filteredResults = res;
                if (searchTerm) {
                    filteredResults = res.filter(pen =>
                        pen.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setFilteredPigPens(filteredResults);
                if (filteredResults.length === 0) {
                    showNotification("Không tìm thấy kết quả phù hợp", "info");
                }
            }
            // Tìm theo tên
            else if (searchTerm) {
                let res;
                if (userRole === 'manager') {
                    res = await pigPenService.searchByName(searchTerm);
                } else {
                    // Tìm theo tên trong phạm vi chuồng nhân viên chăm sóc
                    const allPens = await pigPenService.findByEmployeeId(employeeId);
                    res = allPens.filter(pen =>
                        pen.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setFilteredPigPens(res);
                if (res.length === 0) {
                    showNotification("Không tìm thấy kết quả phù hợp", "info");
                }
            }
            // Không có tiêu chí tìm kiếm
            else {
                fetchPigPens(userRole, employeeId);
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            showNotification("Có lỗi xảy ra khi tìm kiếm", "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
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
        fetchPigPens(userRole, employeeId);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN");
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
            setFilteredPigPens((prev) => prev.filter((p) => p.penId !== deleteDialog.penId));
            showNotification("Xóa chuồng nuôi thành công");
        } catch (err) {
            console.error("Lỗi khi xoá chuồng nuôi:", err);
            showNotification("Lỗi khi xóa chuồng nuôi", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    // Xử lý rời chuồng
    const handleLeavePenClick = (penId, penName) => {
        setLeaveDialog({
            open: true,
            penId,
            penName
        });
    };

    const handleLeavePenCancel = () => {
        setLeaveDialog({
            open: false,
            penId: null,
            penName: ''
        });
    };

    const handleLeavePenConfirm = async () => {
        try {
            await pigPenService.removeCaretakerFromPen(leaveDialog.penId, employeeId);
            showNotification(`Đã rời khỏi chuồng ${leaveDialog.penName} thành công`);

            // Cập nhật lại danh sách
            fetchPigPens(userRole, employeeId);
        } catch (err) {
            console.error("Lỗi khi rời khỏi chuồng nuôi:", err);
            showNotification("Lỗi khi rời khỏi chuồng", "error");
        } finally {
            handleLeavePenCancel();
        }
    };

    const handleActionMenuOpen = (event, pen) => {
        setActionMenu({anchorEl: event.currentTarget, pen});
    };

    const handleActionMenuClose = () => {
        setActionMenu({anchorEl: null, pen: null});
    };

    const paginatedPigPens = filteredPigPens.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{py: 2}}>
            {/* Action buttons */}
            <Stack direction="row" spacing={2} mb={3}>
                <h1>Quản lý chuồng nuôi</h1>
            </Stack>

            {/* Search and filter container */}
            <SearchContainer elevation={1} className="search-container">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên chuồng..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action"/>
                                    </InputAdornment>
                                ),
                                sx: {borderRadius: 1}
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={searchLoading ? <CircularProgress size={20} color="inherit"/> : <Search/>}
                            onClick={handleSearch}
                            disabled={searchLoading}
                            sx={{height: '40px'}}
                        >
                            Tìm kiếm
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={5} sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                        <Tooltip title={showDateFilter ? "Ẩn bộ lọc ngày" : "Lọc theo ngày tạo"}>
                            <Button
                                variant="outlined"
                                startIcon={showDateFilter ? <FilterAltOff/> : <FilterAlt/>}
                                onClick={handleToggleDateFilter}
                                size="small"
                                color="primary"
                                className="filter-button"
                            >
                                {showDateFilter ? 'Ẩn bộ lọc' : 'Lọc theo ngày'}
                            </Button>
                        </Tooltip>
                        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                            <Button
                                variant="text"
                                color="error"
                                onClick={handleResetFilters}
                                size="small"
                                startIcon={<Refresh/>}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Grid>

                    {showDateFilter && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="startDate"
                                    label="Từ ngày"
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{shrink: true}}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="endDate"
                                    label="Đến ngày"
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={handleDateRangeChange}
                                    InputLabelProps={{shrink: true}}
                                    size="small"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </SearchContainer>

            {/* Counter */}
            <Typography variant="h6" component="h2" sx={{mb: 2, fontWeight: 'bold'}}>
                Tổng số chuồng: {filteredPigPens.length}
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add/>}
                        onClick={() => setOpenCreateForm(true)}
                        sx={{
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            backgroundColor: '#1E8449',
                            '&:hover': {
                                backgroundColor: '#155d32'
                            }
                        }}
                    >
                        Thêm chuồng nuôi
                    </Button>
                </div>
            </Typography>

            {/* Table with loading state */}
            <TableContainer component={Paper}
                            sx={{borderRadius: '8px', overflow: 'hidden', boxShadow: 2, position: 'relative'}}
                            className="table-container">
                {loading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 1
                    }}>
                        <CircularProgress/>
                    </Box>
                )}
                <Table sx={{minWidth: 650}} aria-label="pigpen table" className="pen-table">
                    <TableHead>
                        <TableRow>
                            <StyledTableHeaderCell>Tên chuồng</StyledTableHeaderCell>
                            {userRole === 'manager' && (
                                <StyledTableHeaderCell>Người chăm sóc</StyledTableHeaderCell>
                            )}
                            <StyledTableHeaderCell>Đang nuôi</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày tạo</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Ngày đóng</StyledTableHeaderCell>
                            <StyledTableHeaderCell>Số lượng</StyledTableHeaderCell>
                            {/* New feed column */}
                            <StyledTableHeaderCell>
                                <Tooltip title="Lượng thức ăn mỗi ngày">
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <RestaurantOutlined sx={{mr: 0.5}}/>
                                        Thức ăn
                                    </Box>
                                </Tooltip>
                            </StyledTableHeaderCell>
                            <StyledTableHeaderCell>Trạng thái</StyledTableHeaderCell>
                            <StyledTableHeaderCell align="center">Hành động</StyledTableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPigPens.length > 0 ? (
                            paginatedPigPens.map((pen, index) => (
                                <TableRow
                                    key={pen.penId}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                                        '&:hover': {backgroundColor: '#f0f7ff'}
                                    }}
                                >
                                    <StyledTableCell sx={{fontWeight: 'medium'}}>{pen.name}</StyledTableCell>
                                    {userRole === 'manager' && (
                                        <StyledTableCell>
                                            <CaretakersList
                                                caretakers={pen.caretakers}/>
                                        </StyledTableCell>
                                    )}
                                    <StyledTableCell>
                                        <AnimalNamesList penId={pen.penId}/>
                                    </StyledTableCell>
                                    <StyledTableCell>{formatDate(pen.createdDate)}</StyledTableCell>
                                    <StyledTableCell>{formatDate(pen.closedDate) || "Đang hoạt động"}</StyledTableCell>
                                    <StyledTableCell>{pen.quantity}</StyledTableCell>
                                    {/* Feed amount cell */}
                                    <StyledTableCell>
                                        {getFeedAmountForPen(pen)}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Chip
                                            label={pen.status === "ACTIVE" ? "Đang hoạt động" : "Đã đóng"}
                                            color={pen.status === "ACTIVE" ? "success" : "error"}
                                            size="small"
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <IconButton
                                            onClick={(event) => handleActionMenuOpen(event, pen)}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </StyledTableCell>
                                </TableRow>
                            ))
                        ) : !loading && (
                            <TableRow>
                                <TableCell colSpan={userRole === 'manager' ? 9 : 8} align="center" sx={{py: 3}}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {/* Menu thao tác cho pen */}
                <Menu
                    anchorEl={actionMenu.anchorEl}
                    open={Boolean(actionMenu.anchorEl)}
                    onClose={handleActionMenuClose}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    transformOrigin={{vertical: 'top', horizontal: 'right'}}
                >
                    <MenuItem onClick={() => {
                        setSelectedPigPen(actionMenu.pen);
                        setOpenUpdateForm(true);
                        handleActionMenuClose();
                    }}>
                        <ListItemIcon><Edit fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText>Chỉnh sửa</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        // Navigate to feed history for this pen
                        navigate(`/dashboard/feed-history/pen/${actionMenu.pen.penId}`);
                        handleActionMenuClose();
                    }}>
                        <ListItemIcon><HistoryIcon fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText>Lịch sử cho ăn</ListItemText>
                    </MenuItem>
                    {userRole === 'staff' && (
                        <MenuItem onClick={() => {
                            handleAutoFeed(actionMenu.pen);
                            handleActionMenuClose();
                        }}>
                            <ListItemIcon><RestaurantIcon fontSize="small" color="success"/></ListItemIcon>
                            <ListItemText>Cho ăn</ListItemText>
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => {
                        handleDeleteClick(actionMenu.pen.penId);
                        handleActionMenuClose();
                    }}>
                        <ListItemIcon><Delete fontSize="small" color="error"/></ListItemIcon>
                        <ListItemText>Xóa</ListItemText>
                    </MenuItem>
                </Menu>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredPigPens.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({from, to, count}) => `${from}-${to} của ${count}`}
            />

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Dialogs */}
            <Dialog
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{sx: {maxWidth: '600px', borderRadius: '8px'}}}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <AddHomeWorkIcon color="primary"/>
                    <Typography variant="h6" component="div">Thêm chuồng nuôi</Typography>
                </DialogTitle>
                <DialogContent sx={{p: 0}}>
                    <PigPenFormCreate
                        onClose={(success) => {
                            setOpenCreateForm(false);
                            if (success) {
                                showNotification("Thêm chuồng nuôi thành công");
                                fetchPigPens(userRole, employeeId);
                                fetchFeedData();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{sx: {maxWidth: '600px', borderRadius: '8px'}}}
            >
                <DialogTitle sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <AddHomeWorkIcon color="primary"/>
                    <Typography variant="h6" component="div">Cập nhật chuồng nuôi</Typography>
                </DialogTitle>
                <DialogContent sx={{p: 0}}>
                    <PigPenFormUpdate
                        pigPenData={selectedPigPen}
                        onClose={(success) => {
                            setOpenUpdateForm(false);
                            setSelectedPigPen(null);
                            if (success) {
                                showNotification("Cập nhật chuồng nuôi thành công");
                                fetchPigPens(userRole, employeeId);
                                fetchFeedData();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{sx: {borderRadius: '8px'}}}
            >
                <DialogTitle id="alert-dialog-title" sx={{borderBottom: '1px solid #e0e0e0'}}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{mt: 2}}>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa chuồng nuôi này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{px: 3, py: 2}}>
                    <Button onClick={handleDeleteCancel} color="primary" variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Hộp thoại xác nhận rời chuồng */}
            <Dialog
                open={leaveDialog.open}
                onClose={handleLeavePenCancel}
                aria-labelledby="leave-dialog-title"
                aria-describedby="leave-dialog-description"
                PaperProps={{sx: {borderRadius: '8px'}}}
            >
                <DialogTitle id="leave-dialog-title" sx={{borderBottom: '1px solid #e0e0e0'}}>
                    Xác nhận rời chuồng
                </DialogTitle>
                <DialogContent sx={{mt: 2}}>
                    <DialogContentText id="leave-dialog-description">
                        Bạn có chắc chắn muốn rời khỏi chuồng "{leaveDialog.penName}" không?
                        <Typography variant="body2" color="error" sx={{mt: 1}}>
                            Lưu ý: Bạn sẽ không còn là người chăm sóc của chuồng này nữa!
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{px: 3, py: 2}}>
                    <Button onClick={handleLeavePenCancel} color="primary" variant="outlined">
                        Hủy
                    </Button>
                    <Button onClick={handleLeavePenConfirm} color="error" variant="contained" autoFocus>
                        Xác nhận rời
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}