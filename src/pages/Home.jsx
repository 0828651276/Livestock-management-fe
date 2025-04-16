import React from 'react';
import { Container, Grid, Paper, Typography, Avatar, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PetsIcon from '@mui/icons-material/Pets';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { styled } from '@mui/material/styles';

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
    width: 80,
    height: 80,
    backgroundColor: color || theme.palette.primary.main,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
        fontSize: 40,
        color: 'white'
    }
}));

const features = [
    { id: 'system', title: 'QUẢN LÝ HỆ THỐNG', icon: <SettingsIcon />, color: '#757575' },
    { id: 'pigs', title: 'QUẢN LÝ THÔNG TIN ĐÀN', icon: <PetsIcon />, color: '#F06292' },
    { id: 'food', title: 'QUẢN LÝ THỨC ĂN', icon: <RestaurantIcon />, color: '#FFD600' },
    { id: 'health', title: 'QUẢN LÝ BỆNH LÝ', icon: <MedicalServicesIcon />, color: '#E53935' },
    { id: 'export', title: 'QUẢN LÝ XUẤT CHUỒNG', icon: <LocalShippingIcon />, color: '#0D47A1' }
];

function Home({ onFeatureClick }) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4} justifyContent="center">
                    {features.map((feature) => (
                        <Grid item xs={12} sm={6} md={4} key={feature.id}>
                            <Paper elevation={3} sx={{
                                p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' }
                            }}
                                   onClick={() => onFeatureClick(feature.id)}>
                                <FeatureIcon color={feature.color}>{feature.icon}</FeatureIcon>
                                <Typography variant="subtitle1" align="center" sx={{ mt: 2, fontWeight: 'bold' }}>
                                    {feature.title}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default Home;
