import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Container,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Card,
    CardContent,
    Chip,
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
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HouseIcon from '@mui/icons-material/House';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { animalService } from '../services/animalService';
import { pigPenService } from '../services/pigPenService';
import { medicalService } from '../services/medicalService';
import { fetchFeedInventory } from '../services/feedWarehouseService';

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
    width: 60,
    height: 60,
    backgroundColor: color || theme.palette.primary.main,
    margin: '0 auto 16px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
        fontSize: 30,
        color: 'white'
    },
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
}));

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
const StyledTableRow = styled(TableRow)(({ theme }) => ({
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
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: 'none',
    fontSize: 15,
    color: '#333',
    paddingTop: 10,
    paddingBottom: 10,
}));

const features = [
    {
        id: 'pigs',
        title: 'QUẢN LÝ ĐÀN',
        icon: <PetsIcon fontSize="large" />,
        color: '#FF6D28',
        description: 'Quản lý thông tin đàn lợn, tình trạng sức khỏe và phát triển'
    },
    {
        id: 'food',
        title: 'QUẢN LÝ THỨC ĂN',
        icon: <RestaurantIcon fontSize="large" />,
        color: '#28FFBF',
        description: 'Theo dõi lượng thức ăn, dinh dưỡng và lịch cho ăn'
    },
    {
        id: 'health',
        title: 'QUẢN LÝ Y TẾ',
        icon: <MedicalServicesIcon fontSize="large" />,
        color: '#F94C66',
        description: 'Lịch tiêm phòng, khám bệnh và điều trị cho đàn lợn'
    },
    {
        id: 'export',
        title: 'XUẤT CHUỒNG',
        icon: <LocalShippingIcon fontSize="large" />,
        color: '#3F72AF',
        description: 'Quản lý quy trình xuất chuồng và thông tin vận chuyển'
    },
    {
        id: 'analytics',
        title: 'BÁO CÁO & THỐNG KÊ',
        icon: <AnalyticsIcon fontSize="large" />,
        color: '#884A39',
        description: 'Phân tích dữ liệu hoạt động và hiệu quả kinh tế'
    },
    {
        id: 'settings',
        title: 'CÀI ĐẶT HỆ THỐNG',
        icon: <SettingsIcon fontSize="large" />,
        color: '#735CDD',
        description: 'Cấu hình hệ thống, quản lý người dùng và phân quyền'
    }
];

function Home() {
    const [animalCount, setAnimalCount] = useState(null);
    const [penCount, setPenCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [medicalLoading, setMedicalLoading] = useState(true);
    const [feedAmount, setFeedAmount] = useState(null);
    const [feedLoading, setFeedLoading] = useState(true);

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
                console.log('Feed inventory data:', data);
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

    const recentActivities = [
        {
            id: 1,
            type: 'feed',
            description: 'Cung cấp thức ăn cho khu vực A',
            timestamp: '08:30 - 14/04/2025',
            user: 'Nguyễn Văn A'
        },
        {
            id: 2,
            type: 'medical',
            description: 'Tiêm vắc xin cho đàn lợn mới nhập',
            timestamp: '14:45 - 13/04/2025',
            user: 'Trần Thị B'
        },
        {
            id: 3,
            type: 'export',
            description: 'Xuất chuồng 50 con lợn thịt',
            timestamp: '10:15 - 12/04/2025',
            user: 'Lê Minh C'
        },
        {
            id: 4,
            type: 'import',
            description: 'Nhập 30 con lợn giống mới',
            timestamp: '16:20 - 11/04/2025',
            user: 'Phạm Văn D'
        }
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Tiêm phòng đợt 2/2025',
            date: '18/04/2025',
            time: '08:00',
            location: 'Khu vực B, C',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Kiểm tra chất lượng thức ăn',
            date: '20/04/2025',
            time: '09:30',
            location: 'Kho thức ăn',
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Bảo trì hệ thống nước',
            date: '22/04/2025',
            time: '13:00',
            location: 'Toàn trại',
            priority: 'medium'
        },
        {
            id: 4,
            title: 'Đánh giá tăng trưởng tháng 4',
            date: '30/04/2025',
            time: '14:30',
            location: 'Phòng họp',
            priority: 'high'
        }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return '#F94C66';
            case 'medium':
                return '#FFA41B';
            case 'low':
                return '#28FFBF';
            default:
                return '#9E9E9E';
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'feed':
                return <RestaurantIcon sx={{ color: '#28FFBF' }} />;
            case 'medical':
                return <MedicalServicesIcon sx={{ color: '#F94C66' }} />;
            case 'export':
                return <LocalShippingIcon sx={{ color: '#3F72AF' }} />;
            case 'import':
                return <PetsIcon sx={{ color: '#FF6D28' }} />;
            default:
                return <NotificationsIcon sx={{ color: '#9E9E9E' }} />;
        }
    };

    const handleFeatureClick = (featureId) => {
        console.log(`Chức năng ${featureId} được chọn`);
    };

    // Helper: split records
    const today = new Date();
    const historyRecords = medicalRecords.filter(r => {
        const date = new Date(r.treatmentDate);
        return (r.status === 'completed') || (date < today && r.status !== 'scheduled');
    });
    const scheduleRecords = medicalRecords.filter(r => {
        const date = new Date(r.treatmentDate);
        return (r.status === 'scheduled' || date >= today);
    });

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#F5F7FA', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
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
                            bottom: -40,
                            right: 60,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                    />

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                                Chào mừng trở lại, Admin!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                                Trang tổng quan hiển thị thông tin về tình trạng trang trại. Kiểm tra các số liệu thống kê và lịch hoạt động sắp tới.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box sx={{ textAlign: 'right' }}>
                                <CalendarMonthIcon sx={{ fontSize: 60, opacity: 0.9 }} />
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    {new Date().toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Box>
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

                {/* Main features */}
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Chức năng chính
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {features.map((feature) => (
                        <Grid item xs={12} sm={6} md={4} key={feature.id}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { transform: 'scale(1.03)' }
                                }}
                                onClick={() => handleFeatureClick(feature.id)}
                            >
                                <FeatureIcon color={feature.color}>{feature.icon}</FeatureIcon>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            {/* Medical tables always side by side */}
            <Container maxWidth={false} sx={{ px: { xs: 1, md: 4 }, mt: 0, mb: 0 }}>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                        }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                                    Lịch sử chữa trị
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
                                                    <StyledTableHeadCell>THÚ Y</StyledTableHeadCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                {historyRecords.length === 0 ? (
                                                    <StyledTableRow>
                                                        <StyledTableCell colSpan={3} align="center">Không có dữ liệu</StyledTableCell>
                                                    </StyledTableRow>
                                                ) : historyRecords.map((rec, idx) => (
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
                            justifyContent: 'flex-start'
                        }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                                    Lịch chữa trị sắp tới
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
                                                    <StyledTableHeadCell>THÚ Y</StyledTableHeadCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                {scheduleRecords.length === 0 ? (
                                                    <StyledTableRow>
                                                        <StyledTableCell colSpan={3} align="center">Không có dữ liệu</StyledTableCell>
                                                    </StyledTableRow>
                                                ) : scheduleRecords.map((rec, idx) => (
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
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Home;
