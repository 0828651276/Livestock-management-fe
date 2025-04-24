import React, {useEffect, useState} from "react";
import {animalService} from "../../services/animalService";
import {pigPenService} from "../../services/pigPenService";
import {
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Stack,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    ArrowBack,
    FilterAlt,
    VisibilityOutlined,
    LocalShippingOutlined,
    MoreVert
} from "@mui/icons-material";
import {styled} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";
import AnimalFormCreate from "./AnimalFormCreate";
import AnimalFormUpdate from "./AnimalFormUpdate";
import {format} from "date-fns";

// Styled components
const StyledTableCell = styled(TableCell)(({theme}) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: "bold",
    padding: "16px"
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
}));

export default function AnimalManager() {
    const navigate = useNavigate();
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);
    const [pigPens, setPigPens] = useState([]);
    const [emptyPens, setEmptyPens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        animalId: null
    });
    const [exportDialog, setExportDialog] = useState({
        open: false,
        animalId: null
    });

    // Menu thao tác
    const [actionMenu, setActionMenu] = useState({
        anchorEl: null,
        animal: null
    });

    // Filters
    const [nameFilter, setNameFilter] = useState("");
    const [healthStatusFilter, setHealthStatusFilter] = useState("");
    const [raisingStatusFilter, setRaisingStatusFilter] = useState("");
    const [penIdFilter, setPenIdFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [nameFilter, healthStatusFilter, raisingStatusFilter, penIdFilter, animals]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [animalsData, pensData, emptyPensData] = await Promise.all([
                animalService.getAll(),
                pigPenService.getAllPigPens(),
                pigPenService.getEmptyPens()
            ]);
            setAnimals(animalsData);
            setFilteredAnimals(animalsData);
            setPigPens(pensData);
            setEmptyPens(emptyPensData);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            showNotification("Lỗi khi tải dữ liệu", "error");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...animals];

        if (nameFilter) {
            filtered = filtered.filter(animal =>
                animal.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        if (healthStatusFilter) {
            filtered = filtered.filter(
                animal => animal.healthStatus === healthStatusFilter
            );
        }

        if (raisingStatusFilter) {
            filtered = filtered.filter(
                animal => animal.raisingStatus === raisingStatusFilter
            );
        }

        if (penIdFilter) {
            filtered = filtered.filter(
                animal => animal.pigPen && animal.pigPen.penId === Number(penIdFilter)
            );
        }

        setFilteredAnimals(filtered);
        setPage(0);
    };

    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };

    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCreateAnimal = () => {
        setOpenCreateForm(true);
    };

    const handleUpdateAnimal = (animal) => {
        setSelectedAnimal(animal);
        setOpenUpdateForm(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({
            open: true,
            animalId: id
        });
    };

    const handleExportClick = (id) => {
        setExportDialog({
            open: true,
            animalId: id
        });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            animalId: null
        });
    };

    const handleExportCancel = () => {
        setExportDialog({
            open: false,
            animalId: null
        });
    };

    // Xử lý menu thao tác
    const handleActionMenuOpen = (event, animal) => {
        setActionMenu({
            anchorEl: event.currentTarget,
            animal: animal
        });
    };

    const handleActionMenuClose = () => {
        setActionMenu({
            anchorEl: null,
            animal: null
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await animalService.delete(deleteDialog.animalId);
            setAnimals(animals.filter(a => a.pigId !== deleteDialog.animalId));
            showNotification("Xóa động vật thành công");
        } catch (err) {
            console.error("Lỗi khi xóa động vật:", err);
            showNotification("Lỗi khi xóa động vật", "error");
        } finally {
            handleDeleteCancel();
        }
    };

    const handleExportConfirm = async () => {
        try {
            await animalService.exportAnimal(exportDialog.animalId);
            // Refresh data after exporting
            fetchData();
            showNotification("Xuất chuồng thành công");
        } catch (err) {
            console.error("Lỗi khi xuất chuồng:", err);
            showNotification("Lỗi khi xuất chuồng", "error");
        } finally {
            handleExportCancel();
        }
    };

    const handleResetFilters = () => {
        setNameFilter("");
        setHealthStatusFilter("");
        setRaisingStatusFilter("");
        setPenIdFilter("");
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            return format(new Date(dateString), "dd/MM/yyyy");
        } catch (error) {
            return dateString;
        }
    };

    // Get pen name
    const getPenName = (penId) => {
        if (!penId) return "—";
        const pen = pigPens.find(p => p.penId === penId);
        return pen ? pen.name : `Chuồng #${penId}`;
    };

    // Get health status chip
    const getHealthStatusChip = (status) => {
        switch (status) {
            case "ACTIVE":
                return <Chip label="Khỏe mạnh" color="success" size="small"/>;
            case "SICK":
                return <Chip label="Bị bệnh" color="error" size="small"/>;
            default:
                return <Chip label={status} size="small"/>;
        }
    };

    // Get raising status chip
    const getRaisingStatusChip = (status) => {
        switch (status) {
            case "RAISING":
                return <Chip label="Đang nuôi" color="primary" size="small"/>;
            case "EXPORTED":
                return <Chip label="Đã xuất" color="secondary" size="small"/>;
            default:
                return <Chip label={status} size="small"/>;
        }
    };

    // Get displayed animals for current page
    const displayedAnimals = filteredAnimals
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{p: 3}}>
            {/* Header */}
            <Box sx={{display: "flex", alignItems: "center", mb: 3}}>
                <IconButton
                    onClick={() => navigate("/dashboard")}
                    sx={{mr: 2, bgcolor: "#f5f5f5"}}
                >
                    <ArrowBack/>
                </IconButton>
                <Typography variant="h5" component="h1" sx={{fontWeight: "bold"}}>
                    Quản lý động vật
                </Typography>
                <Box sx={{flexGrow: 1}}/>

            </Box>

            {/* Thanh tìm kiếm và lọc */}
            <StyledPaper sx={{mb: 3, p: 2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên..."
                            variant="outlined"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search/>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterAlt/>}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{mr: 1}}
                        >
                            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                        </Button>
                        {(nameFilter || healthStatusFilter || raisingStatusFilter || penIdFilter) && (
                            <Button
                                variant="text"
                                color="inherit"
                                onClick={handleResetFilters}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Grid>

                    {showFilters && (
                        <>
                            <Grid item xs={12} md={4} sx={{mt: 2}}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="health-status-label">Trạng thái sức khỏe</InputLabel>
                                    <Select
                                        labelId="health-status-label"
                                        value={healthStatusFilter}
                                        onChange={(e) => setHealthStatusFilter(e.target.value)}
                                        label="Trạng thái sức khỏe"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                                        <MenuItem value="SICK">Bị bệnh</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{mt: 2}}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="raising-status-label">Trạng thái nuôi</InputLabel>
                                    <Select
                                        labelId="raising-status-label"
                                        value={raisingStatusFilter}
                                        onChange={(e) => setRaisingStatusFilter(e.target.value)}
                                        label="Trạng thái nuôi"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="RAISING">Đang nuôi</MenuItem>
                                        <MenuItem value="EXPORTED">Đã xuất</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{mt: 2}}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="pen-label">Chuồng nuôi</InputLabel>
                                    <Select
                                        labelId="pen-label"
                                        value={penIdFilter}
                                        onChange={(e) => setPenIdFilter(e.target.value)}
                                        label="Chuồng nuôi"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {pigPens.map(pen => (
                                            <MenuItem key={pen.penId} value={pen.penId}>
                                                {pen.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </>
                    )}
                </Grid>
            </StyledPaper>

            {/* Danh sách động vật */}
            <StyledPaper>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                    <Typography variant="h6" sx={{fontWeight: "bold"}}>
                        Danh sách động vật
                    </Typography>
                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                        Tổng số: {filteredAnimals.length} cá thể
                    </Typography>
                </Box>
                <Box sx={{mb: 2}}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add/>}
                        onClick={handleCreateAnimal}
                        sx={{
                            backgroundColor: "#1E8449",
                            "&:hover": {
                                backgroundColor: "#14532d"
                            }
                        }}
                    >
                        Thêm mới
                    </Button>
                </Box>
                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", p: 3}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>ID</StyledTableCell>
                                    <StyledTableCell>Tên</StyledTableCell>
                                    <StyledTableCell>Chuồng nuôi</StyledTableCell>
                                    <StyledTableCell>Ngày nhập</StyledTableCell>
                                    <StyledTableCell>Ngày xuất</StyledTableCell>
                                    <StyledTableCell>Cân nặng (kg)</StyledTableCell>
                                    <StyledTableCell>Số lượng</StyledTableCell>
                                    <StyledTableCell>Sức khỏe</StyledTableCell>
                                    <StyledTableCell>Trạng thái</StyledTableCell>
                                    <StyledTableCell align="center">Thao tác</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedAnimals.length > 0 ? (
                                    displayedAnimals.map((animal) => (
                                        <TableRow key={animal.pigId} hover>
                                            <TableCell>{animal.pigId}</TableCell>
                                            <TableCell>{animal.name}</TableCell>
                                            <TableCell>
                                                {animal.pigPen ? animal.pigPen.name : "—"}
                                            </TableCell>
                                            <TableCell>{formatDate(animal.entryDate)}</TableCell>
                                            <TableCell>{formatDate(animal.exitDate)}</TableCell>
                                            <TableCell>{animal.weight}</TableCell>
                                            <TableCell>{animal.quantity}</TableCell>
                                            <TableCell>{getHealthStatusChip(animal.healthStatus)}</TableCell>
                                            <TableCell>{getRaisingStatusChip(animal.raisingStatus)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    aria-label="thao tác"
                                                    size="small"
                                                    onClick={(event) => handleActionMenuOpen(event, animal)}
                                                >
                                                    <MoreVert/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            {(nameFilter || healthStatusFilter || raisingStatusFilter || penIdFilter)
                                                ? "Không tìm thấy động vật phù hợp với điều kiện tìm kiếm"
                                                : "Không có dữ liệu"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {filteredAnimals.length > 0 && (
                            <Box sx={{p: 2}}>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 50]}
                                    component="div"
                                    count={filteredAnimals.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelDisplayedRows={({from, to, count}) =>
                                        `${from}-${to} của ${count}`
                                    }
                                    labelRowsPerPage="Hàng mỗi trang:"
                                />
                            </Box>
                        )}
                    </TableContainer>
                )}
            </StyledPaper>

            {/* Form dialog thêm mới */}
            <Dialog
                open={openCreateForm}
                onClose={() => setOpenCreateForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{fontWeight: "bold"}}>
                    Thêm động vật mới
                </DialogTitle>
                <DialogContent dividers>
                    <AnimalFormCreate
                        pigPens={emptyPens}
                        onSuccess={() => {
                            setOpenCreateForm(false);
                            setTimeout(() => {
                                fetchData();
                            }, 200); // Chờ 200ms
                            showNotification("Thêm mới động vật thành công");
                        }}
                        onCancel={() => setOpenCreateForm(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Form dialog cập nhật */}
            <Dialog
                open={openUpdateForm}
                onClose={() => setOpenUpdateForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{fontWeight: "bold"}}>
                    Cập nhật thông tin động vật
                </DialogTitle>
                <DialogContent dividers>
                    {selectedAnimal && (
                        <AnimalFormUpdate
                            animal={selectedAnimal}
                            pigPens={
                                selectedAnimal.pigPen
                                    ? [
                                        selectedAnimal.pigPen,
                                        ...emptyPens.filter(
                                            (pen) => pen.penId !== selectedAnimal.pigPen.penId
                                        )
                                    ]
                                    : emptyPens
                            }
                            onSuccess={() => {
                                setOpenUpdateForm(false);
                                setSelectedAnimal(null);
                                fetchData();
                                showNotification("Cập nhật thông tin thành công");
                            }}
                            onCancel={() => {
                                setOpenUpdateForm(false);
                                setSelectedAnimal(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa cá thể động vật này không?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xuất chuồng */}
            <Dialog
                open={exportDialog.open}
                onClose={handleExportCancel}
            >
                <DialogTitle>Xác nhận xuất chuồng</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xuất chuồng cá thể động vật này không?
                    </Typography>
                    <Typography variant="body2" sx={{mt: 1, color: "text.secondary"}}>
                        Thao tác này sẽ đánh dấu động vật là đã xuất chuồng và ghi nhận ngày xuất là ngày hôm nay.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleExportCancel} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleExportConfirm} color="secondary" variant="contained">
                        Xuất chuồng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{width: "100%"}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Menu thao tác */}
            <Menu
                anchorEl={actionMenu.anchorEl}
                open={Boolean(actionMenu.anchorEl)}
                onClose={handleActionMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleUpdateAnimal(actionMenu.animal);
                        handleActionMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <Edit fontSize="small" color="primary"/>
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                </MenuItem>

                {actionMenu.animal?.raisingStatus === "RAISING" && (
                    <MenuItem
                        onClick={() => {
                            handleExportClick(actionMenu.animal?.pigId);
                            handleActionMenuClose();
                        }}
                    >
                        <ListItemIcon>
                            <LocalShippingOutlined fontSize="small" color="secondary"/>
                        </ListItemIcon>
                        <ListItemText>Xuất chuồng</ListItemText>
                    </MenuItem>
                )}

                <MenuItem
                    onClick={() => {
                        handleDeleteClick(actionMenu.animal?.pigId);
                        handleActionMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <Delete fontSize="small" color="error"/>
                    </ListItemIcon>
                    <ListItemText>Xóa</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}