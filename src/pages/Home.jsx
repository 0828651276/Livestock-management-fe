import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Card,
    CardContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HouseIcon from '@mui/icons-material/House';
import { animalService } from '../services/animalService';
import { pigPenService } from '../services/pigPenService';
import { medicalService } from '../services/medicalService';
import { fetchFeedInventory } from '../services/feedWarehouseService';
import Pagination from '@mui/material/Pagination';
import { vaccinationService } from '../services/VaccinationService';

const StatCard = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(2.5),
    borderRadius: 12,
    backgroundColor: color || '#ffffff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    },
}));

// Styled table for medical cards
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    overflow: 'hidden',
}));
const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
    background: theme.palette.success.main,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    border: 'none',
    textTransform: 'uppercase',
    letterSpacing: 1,
}));
const StyledTableRow = styled(TableRow)(() => ({
    '&:hover': {
        background: '#f5f7fa',
    },
    transition: 'background 0.2s',
    '& td': {
        borderBottom: '1px solid #e0e0e0',
    },
    '&:last-of-type td': {
        borderBottom: 'none',
    },
}));
const StyledTableCell = styled(TableCell)(() => ({
    border: 'none',
    fontSize: 15,
    color: '#333',
    paddingTop: 10,
    paddingBottom: 10,
}));



function Home() {
    const [animalCount, setAnimalCount] = useState(null);
    const [penCount, setPenCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [medicalLoading, setMedicalLoading] = useState(true);
    const [feedAmount, setFeedAmount] = useState(null);
    const [feedLoading, setFeedLoading] = useState(true);
    const [upcomingVaccinationPage, setUpcomingVaccinationPage] = useState(1);
    const [schedulePage, setSchedulePage] = useState(1);
    const rowsPerPage = 4;
    const [vaccinationRecords, setVaccinationRecords] = useState([]);
    const [vaccinationLoading, setVaccinationLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [animals, pens] = await Promise.all([
                    animalService.getAll(),
                    pigPenService.getAllPigPens()
                ]);
                // Sum all animal.quantity (default 1 if missing)
                const totalQuantity = Array.isArray(animals)
                    ? animals.reduce((sum, animal) => sum + (Number(animal.quantity) || 1), 0)
                    : 0;
                setAnimalCount(totalQuantity);
                setPenCount(Array.isArray(pens) ? pens.length : 0);
            } catch (error) {
                setAnimalCount(0);
                setPenCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchMedical = async () => {
            setMedicalLoading(true);
            try {
                const data = await medicalService.getAllMedical();
                setMedicalRecords(Array.isArray(data) ? data : []);
            } catch (e) {
                setMedicalRecords([]);
            } finally {
                setMedicalLoading(false);
            }
        };
        fetchMedical();

        const fetchFeed = async () => {
            setFeedLoading(true);
            try {
                const data = await fetchFeedInventory();
                // Tính tổng tồn kho: cộng tất cả remainingQuantity
                let total = 0;
                if (Array.isArray(data)) {
                    total = data.reduce((sum, item) => sum + (Number(item.remainingQuantity) || 0), 0);
                }
                setFeedAmount(total);
            } catch (e) {
                setFeedAmount(0);
            } finally {
                setFeedLoading(false);
            }
        };
        fetchFeed();

        const fetchVaccinations = async () => {
            setVaccinationLoading(true);
            try {
                const data = await vaccinationService.getAllMedical();
                setVaccinationRecords(Array.isArray(data) ? data : []);
            } catch (e) {
                setVaccinationRecords([]);
            } finally {
                setVaccinationLoading(false);
            }
        };
        fetchVaccinations();
    }, []);

    const statistics = [
        {
            title: 'TỔNG ĐÀN',
            value: loading ? '...' : animalCount,
            unit: 'con',
            color: '#F7EFE5',
            textColor: '#3C2317',
            icon: <PetsIcon sx={{ color: '#3C2317' }} />,
            change: ''
        },
        {
            title: 'SỐ CHUỒNG NUÔI',
            value: loading ? '...' : penCount,
            unit: 'chuồng',
            color: '#E8F3D6',
            textColor: '#34752B',
            icon: <HouseIcon sx={{ color: '#34752B' }} />,
            change: ''
        },
        {
            title: 'LƯỢNG THỨC ĂN',
            value: feedLoading ? '...' : (feedAmount >= 1000 ? (feedAmount / 1000).toFixed(2) : feedAmount),
            unit: feedLoading ? '' : (feedAmount >= 1000 ? 'tấn' : 'kg'),
            color: '#FCF9BE',
            textColor: '#CE9461',
            icon: <RestaurantIcon sx={{ color: '#CE9461' }} />,
            change: ''
        }
    ];

    // Helper: split records
    const today = new Date();
    const upcomingVaccinations = vaccinationRecords.filter(r => {
        const date = new Date(r.date);
        return r.status === 'SCHEDULED' && date >= today;
    });
    const scheduleRecords = medicalRecords.filter(r => {
        const date = new Date(r.treatmentDate);
        return (r.status === 'scheduled' || date >= today);
    });
    // Phân trang
    const paginatedUpcomingVaccinations = upcomingVaccinations.slice((upcomingVaccinationPage - 1) * rowsPerPage, upcomingVaccinationPage * rowsPerPage);
    const paginatedSchedule = scheduleRecords.slice((schedulePage - 1) * rowsPerPage, schedulePage * rowsPerPage);

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#F5F7FA', minHeight: '100vh', py: 4 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
                {/* Welcome banner */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        mt: 2,
                        borderRadius: 3,
                        backgroundColor: '#1E8449',
                        background: 'linear-gradient(135deg, #1E8449 0%, #196F3D 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 60,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            overflow: 'hidden',
                            border: 'none',
                            boxShadow: 'none'
                        }}
                    >
                        <img src="https://hienlaptop.com/wp-content/uploads/2024/11/Download-Mien-Phi-File-Vector-PNG-PSD-Hinh-Con-Heo-Dep-Doc-Dao-2.png" alt="Pig" style={{ width: '100%', height: '100%' }} />
                    </Box>

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                                Chào mừng trở lại!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                                Trang tổng quan hiển thị thông tin về tình trạng trang trại. Kiểm tra các số liệu thống kê và lịch hoạt động sắp tới.
                            </Typography>
                        </Grid>

                    </Grid>
                </Paper>

                {/* Statistics */}
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Tổng quan trang trại
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statistics.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <StatCard color={stat.color}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: stat.textColor, mb: 1 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: stat.textColor, fontWeight: 'bold', mb: 0.5 }}>
                                            {stat.value} <Typography component="span" variant="body2">{stat.unit}</Typography>
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: stat.textColor }}>
                                            {stat.change}
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.7)',
                                            width: 48,
                                            height: 48
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                </Box>
                            </StatCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Medical tables always side by side */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            width: '100%'
                        }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2, textAlign: 'center' }}>
                                    Lịch tiêm phòng sắp tới
                                </Typography>
                                {vaccinationLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <StyledTableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableHeadCell>NGÀY TIÊM</StyledTableHeadCell>
                                                    <StyledTableHeadCell>TÊN ĐỘNG VẬT</StyledTableHeadCell>
                                                    <StyledTableHeadCell>TÊN VẮC-XIN</StyledTableHeadCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                {upcomingVaccinations.length === 0 ? (
                                                    <StyledTableRow>
                                                        <StyledTableCell colSpan={4} align="center">Không có dữ liệu</StyledTableCell>
                                                    </StyledTableRow>
                                                ) : paginatedUpcomingVaccinations.map((rec, idx) => (
                                                    <StyledTableRow key={rec.id || idx}>
                                                        <StyledTableCell>{rec.date || '-'}</StyledTableCell>
                                                        <StyledTableCell>{rec.animal?.name || '-'}</StyledTableCell>
                                                        <StyledTableCell>{rec.vaccine || '-'}</StyledTableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </StyledTableContainer>
                                )}
                                {/* Pagination cho lịch tiêm phòng sắp tới */}
                                {upcomingVaccinations.length > rowsPerPage && (
                                    <Pagination
                                        count={Math.ceil(upcomingVaccinations.length / rowsPerPage)}
                                        page={upcomingVaccinationPage}
                                        onChange={(_, value) => setUpcomingVaccinationPage(value)}
                                        color="primary"
                                        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            width: '100%'
                        }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2, textAlign: 'center' }}>
                                    Lịch khám chữa bệnh sắp tới
                                </Typography>
                                {medicalLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <StyledTableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableHeadCell>NGÀY ĐIỀU TRỊ</StyledTableHeadCell>
                                                    <StyledTableHeadCell>TÊN ĐỘNG VẬT</StyledTableHeadCell>
                                                    <StyledTableHeadCell>ĐỊA CHỈ</StyledTableHeadCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                {scheduleRecords.length === 0 ? (
                                                    <StyledTableRow>
                                                        <StyledTableCell colSpan={3} align="center">Không có dữ liệu</StyledTableCell>
                                                    </StyledTableRow>
                                                ) : paginatedSchedule.map((rec, idx) => (
                                                    <StyledTableRow key={rec.id || idx}>
                                                        <StyledTableCell>{rec.treatmentDate || '-'}</StyledTableCell>
                                                        <StyledTableCell>{rec.animal?.name || '-'}</StyledTableCell>
                                                        <StyledTableCell>{rec.veterinarian || '-'}</StyledTableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </StyledTableContainer>
                                )}
                                {/* Pagination cho lịch chữa trị sắp tới */}
                                {scheduleRecords.length > rowsPerPage && (
                                    <Pagination
                                        count={Math.ceil(scheduleRecords.length / rowsPerPage)}
                                        page={schedulePage}
                                        onChange={(_, value) => setSchedulePage(value)}
                                        color="primary"
                                        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Home;