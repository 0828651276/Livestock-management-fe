import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from '../pages/LoginPage';

function MainLayout() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',     
          width: '100vw',
          height: '100vh',
          backgroundColor: '#1E8449', // Giữ màu nền xanh lá cây
          m: 0,
          p: 0
        }}
      >
        <CssBaseline />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <LoginPage /> 
        </Box>
      </Box>
    );
  }
  
export default MainLayout;