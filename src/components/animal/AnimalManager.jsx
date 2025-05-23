import React, {useEffect, useState} from "react";
import {animalService} from "../../services/animalService";
import {pigPenService} from "../../services/pigPenService";
import {medicalService} from "../../services/medicalService";
import CreateMedicalForm from '../medical/CreateMedicalForm';
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
    Grid,
    InputAdornment,
    CircularProgress,
    Menu,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterAlt,
    LocalShippingOutlined,
    MoreVert,
    Schedule
} from "@mui/icons-material";
import {styled} from "@mui/material/styles";
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
    const [animals, setAnimals] = useState([]);
    const [filteredAnimals, setFilteredAnimals] = useState([]);
    const [pigPens, setPigPens] = useState([]);
    const [emptyPens, setEmptyPens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

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
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [selectedAnimalForSchedule, setSelectedAnimalForSchedule] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);

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
        fetchMedicalRecords();
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

    const fetchMedicalRecords = async () => {
        try {
            const medicalRecordsData = await medicalService.getAllMedical();
            setMedicalRecords(medicalRecordsData);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            showNotification("Lỗi khi tải dữ liệu", "error");
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

    const handleOpenScheduleDialog = (animal) => {
        setSelectedAnimalForSchedule(animal);
        setOpenScheduleDialog(true);
    };

    const handleCloseScheduleDialog = () => {
        setOpenScheduleDialog(false);
        setSelectedAnimalForSchedule(null);
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

    // Hàm xác định trạng thái sức khỏe động vật (có đặt lịch chữa trị hay chưa)
    const getCustomHealthStatus = (animal) => {
        if (animal.healthStatus === "SICK") {
            // medicalRecords là mảng các bản ghi điều trị, mỗi bản ghi có thể có trường animal.pigId
            const hasMedical = medicalRecords.some(r => r.animal && r.animal.pigId === animal.pigId);
            if (hasMedical) return "SCHEDULED";
            return "SICK";
        }
        return animal.healthStatus;
    };

    // Get health status chip
    const getHealthStatusChip = (status) => {
        switch (status) {
            case "ACTIVE":
                return <Chip label="Khỏe mạnh" color="success" size="small"/>;
            case "SICK":
                return <Chip label="Bị bệnh" color="error" size="small"/>;
            case "SCHEDULED":
                return <Chip label="Đã đặt lịch chữa trị" color="warning" size="small"/>;
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

    const handleSearch = async () => {
    }
    return (
        <Box sx={{p: 3}}>
            {/* Header */}
            <Box sx={{display: "flex", alignItems: "center", mb: 3}}>
                <Typography variant="h4" component="h1" sx={{fontWeight: "bold"}}>
                    Quản lý vật nuôi
                </Typography>
            </Box>

            {/* Thanh tìm kiếm và lọc */}
            <StyledPaper sx={{mb: 3, p: 2}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
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

                    <Grid item xs={6} md={2}>
                        <Button
                            fullWidth
                            size="medium"
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
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Trạng thái sức khỏe
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={healthStatusFilter}
                                            onChange={(e) => setHealthStatusFilter(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">Tất cả</MenuItem>
                                            <MenuItem value="ACTIVE">Khỏe mạnh</MenuItem>
                                            <MenuItem value="SICK">Bị bệnh</MenuItem>
                                            <MenuItem value="SCHEDULED">Đã đặt lịch chữa trị</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Trạng thái nuôi
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={raisingStatusFilter}
                                            onChange={(e) => setRaisingStatusFilter(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">Tất cả</MenuItem>
                                            <MenuItem value="RAISING">Đang nuôi</MenuItem>
                                            <MenuItem value="EXPORTED">Đã xuất</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Chuồng nuôi
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={penIdFilter}
                                            onChange={(e) => setPenIdFilter(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">Tất cả</MenuItem>
                                            {pigPens.map((pen) => (
                                                <MenuItem key={pen.penId} value={pen.penId}>
                                                    {pen.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </StyledPaper>

            {/* Danh sách động vật */}
            <StyledPaper>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2}}>
                    <Typography variant="h6" sx={{fontWeight: "bold"}}>
                        Danh sách vật nuôi
                    </Typography>
                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                        Tổng số: {filteredAnimals.length} cá thể
                    </Typography>
                </Box>

                {/* Move the Add New button here */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add/>}
                    onClick={handleCreateAnimal}
                    sx={{
                        backgroundColor: "#1E8449",
                        "&:hover": {
                            backgroundColor: "#14532d"
                        },
                        mb: 2 // Add margin bottom for spacing
                    }}
                >
                    Thêm mới
                </Button>

                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", p: 3}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Tên</StyledTableCell>
                                    <StyledTableCell>Chuồng nuôi</StyledTableCell>
                                    <StyledTableCell>Ngày nhập</StyledTableCell>
                                    <StyledTableCell>Ngày xuất</StyledTableCell>
                                    <StyledTableCell>Cân nặng (kg/con)</StyledTableCell>
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
                                            <TableCell>{animal.name}</TableCell>
                                            <TableCell>
                                                {animal.pigPen ? animal.pigPen.name : "—"}
                                            </TableCell>
                                            <TableCell>{formatDate(animal.entryDate)}</TableCell>
                                            <TableCell>{formatDate(animal.exitDate)}</TableCell>
                                            <TableCell>{animal.weight}</TableCell>
                                            <TableCell>{animal.quantity}</TableCell>
                                            <TableCell>{getHealthStatusChip(getCustomHealthStatus(animal))}</TableCell>
                                            <TableCell>{getRaisingStatusChip(animal.raisingStatus)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    aria-label="thao tác"
                                                    size="small"
                                                    onClick={(event) => handleActionMenuOpen(event, animal)}
                                                    disabled={animal.raisingStatus === "EXPORTED"}
                                                >
                                                    <MoreVert/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
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
                maxWidth="sm"
                fullWidth={false}
            >
                <DialogTitle sx={{fontWeight: "bold"}}>
                    Thêm vật nuôi mới
                </DialogTitle>
                <DialogContent dividers>
                    <AnimalFormCreate
                        pigPens={pigPens}
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
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{fontWeight: "bold"}}>
                    Cập nhật thông tin vật nuôi
                </DialogTitle>
                <DialogContent dividers sx={{ p: 2 }}>
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
                        Thao tác này sẽ đánh dấu động vật là đã xuất chuồng và ghi nhận ngày xuất là ngày hôm
                        nay.
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

            {/* Dialog đặt lịch điều trị */}
            <CreateMedicalForm
                open={openScheduleDialog}
                animal={selectedAnimalForSchedule}
                onCreate={async (data) => {
                    await medicalService.createMedical(data);
                    setOpenScheduleDialog(false);
                    setSelectedAnimalForSchedule(null);
                    fetchData();
                    fetchMedicalRecords();
                    showNotification('Đặt lịch điều trị thành công');
                }}
                onCancel={handleCloseScheduleDialog}
            />

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

                <MenuItem
                    disabled={actionMenu.animal?.healthStatus === "ACTIVE"}
                    onClick={() => {
                        handleOpenScheduleDialog(actionMenu.animal);
                        handleActionMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <Schedule fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Đặt lịch điều trị</ListItemText>
                </MenuItem>

                {actionMenu.animal?.raisingStatus === "RAISING" && (
                    <MenuItem
                        disabled={actionMenu.animal?.healthStatus === "SICK"}
                        onClick={() => {
                            handleExportClick(actionMenu.animal.pigId);
                            handleActionMenuClose();
                        }}
                    >
                        <ListItemIcon>
                            <LocalShippingOutlined fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText primary="Xuất chuồng"/>
                    </MenuItem>
                )}

                <MenuItem
                    onClick={() => {
                        handleDeleteClick(actionMenu.animal.pigId);
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