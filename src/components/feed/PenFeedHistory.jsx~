import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TextField,
  Button,
  Stack,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search, 
  FilterAlt, 
  FilterAltOff, 
  Refresh, 
  Close,
  RestaurantOutlined
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { feedHistoryService } from '../../services/feedHistoryService';
import { useParams, useNavigate } from 'react-router-dom';
import { pigPenService } from '../../services/pigPenService';

// Styled components
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

export default function PenFeedHistory() {
  const { penId } = useParams();
  const navigate = useNavigate();
  const [feedHistories, setFeedHistories] = useState([]);
  const [filteredFeedHistories, setFilteredFeedHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [penInfo, setPenInfo] = useState(null);
  const [penLoading, setPenLoading] = useState(false);

  useEffect(() => {
    if (penId) {
      fetchPenInfo();
      fetchFeedHistories();
    }
  }, [penId]);

  const fetchPenInfo = async () => {
    setPenLoading(true);
    try {
      const data = await pigPenService.getPigPenById(penId);
      setPenInfo(data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chuồng:", error);
      showNotification("Không thể tải thông tin chuồng", "error");
    } finally {
      setPenLoading(false);
    }
  };

  const fetchFeedHistories = async () => {
    setLoading(true);
    try {
      const data = await feedHistoryService.getFeedHistoriesByPigPenId(penId);
      const historyArray = Array.isArray(data) ? data : data.content || [];
      setFeedHistories(historyArray);
      setFilteredFeedHistories(historyArray);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử cho ăn:", error);
      showNotification("Không thể tải lịch sử cho ăn", "error");
      setFeedHistories([]);
      setFilteredFeedHistories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      // Nếu có lọc theo ngày
      if (dateRange.startDate && dateRange.endDate) {
        const response = await feedHistoryService.getFeedHistoriesByPigPenId(penId);
        // Đảm bảo data là một mảng
        const historyArray = Array.isArray(response) ? response : response.content || [];
        
        // Lọc theo khoảng thời gian
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        let filteredResults = historyArray.filter(history => {
          const feedingTime = new Date(history.feedingTime);
          return feedingTime >= startDate && feedingTime <= endDate;
        });
        
        // Lọc thêm theo tên nếu có
        if (searchTerm) {
          filteredResults = filteredResults.filter(history => 
            (history.animal?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (history.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setFilteredFeedHistories(filteredResults);
        if (filteredResults.length === 0) {
          showNotification("Không tìm thấy kết quả phù hợp", "info");
        }
      }
      // Tìm theo tên
      else if (searchTerm) {
        const response = await feedHistoryService.getFeedHistoriesByPigPenId(penId);
        // Đảm bảo data là một mảng
        const historyArray = Array.isArray(response) ? response : response.content || [];
        
        const filtered = historyArray.filter(history => 
          (history.animal?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (history.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        setFilteredFeedHistories(filtered);
        if (filtered.length === 0) {
          showNotification("Không tìm thấy kết quả phù hợp", "info");
        }
      }
      // Không có tiêu chí tìm kiếm
      else {
        fetchFeedHistories();
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      showNotification("Có lỗi xảy ra khi tìm kiếm", "error");
      setFilteredFeedHistories([]);
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
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (showDateFilter) {
      setDateRange({ startDate: '', endDate: '' });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange({ startDate: '', endDate: '' });
    fetchFeedHistories();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN");
  };

  const paginatedFeedHistories = filteredFeedHistories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} mb={3} justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" fontWeight="bold">
          {penLoading ? (
            <CircularProgress size={24} />
          ) : (
            `Lịch sử cho ăn - ${penInfo?.name || 'Chuồng'}`
          )}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<Close />} 
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </Stack>

      {/* Search and filter container */}
      <SearchContainer elevation={1} className="search-container">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên động vật hoặc ghi chú..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1 }
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
              onClick={handleSearch}
              disabled={searchLoading}
              sx={{ height: '40px' }}
            >
              Tìm kiếm
            </Button>
          </Grid>
          <Grid item xs={6} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title={showDateFilter ? "Ẩn bộ lọc ngày" : "Lọc theo ngày cho ăn"}>
              <Button
                variant="outlined"
                startIcon={showDateFilter ? <FilterAltOff /> : <FilterAlt />}
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
                startIcon={<Refresh />}
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
                  type="datetime-local"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="endDate"
                  label="Đến ngày"
                  type="datetime-local"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </>
          )}
        </Grid>
      </SearchContainer>

      {/* Counter */}
      <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Tổng số lịch sử: {filteredFeedHistories.length}
      </Typography>

      {/* Table with loading state */}
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: 2, position: 'relative' }}>
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
            <CircularProgress />
          </Box>
        )}
        <Table sx={{ minWidth: 650 }} aria-label="feed history table">
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>ID</StyledTableHeaderCell>
              <StyledTableHeaderCell>Động vật</StyledTableHeaderCell>
              <StyledTableHeaderCell>Kế hoạch cho ăn</StyledTableHeaderCell>
              <StyledTableHeaderCell>Thời gian cho ăn</StyledTableHeaderCell>
              <StyledTableHeaderCell>Lượng thức ăn (g)</StyledTableHeaderCell>
              <StyledTableHeaderCell>Ghi chú</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFeedHistories.length > 0 ? (
              paginatedFeedHistories.map((history, index) => (
                <TableRow
                  key={history.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    '&:hover': { backgroundColor: '#f0f7ff' }
                  }}
                >
                  <StyledTableCell>{history.id}</StyledTableCell>
                  <StyledTableCell>{history.animal?.name || "N/A"}</StyledTableCell>
                  <StyledTableCell>{history.feedPlan?.name || "N/A"}</StyledTableCell>
                  <StyledTableCell>{formatDate(history.feedingTime)}</StyledTableCell>
                  <StyledTableCell>{history.feedAmount}</StyledTableCell>
                  <StyledTableCell>{history.notes || "N/A"}</StyledTableCell>
                </TableRow>
              ))
            ) : !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Không có dữ liệu
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredFeedHistories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="Hiển thị:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
