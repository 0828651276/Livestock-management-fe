import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { authService } from '../services/authService';

function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = authService.getCurrentUser();
    if (!token) {
      window.location.href = '/'; // Redirect to login if not authenticated
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 3,
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard - Quản lý chăn nuôi
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Bạn đã đăng nhập thành công!
        </Typography>
        
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Paper>
    </Box>
  );
}

export default DashboardPage;