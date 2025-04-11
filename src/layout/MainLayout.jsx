import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from '../pages/LoginPage';
// Không cần import ảnh nữa

function MainLayout() {
    // URL ảnh từ internet
    const backgroundImageUrl = 'https://i.pinimg.com/736x/dc/e3/cb/dce3cb7b2daeb86ca5bd921ae06f3b2f.jpg';
    
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',     
          width: '100vw',
          height: '100vh',
          background: `url(${backgroundImageUrl}) center center no-repeat`,
          backgroundSize: 'cover', // Phủ kín màn hình
          m: 0,
          p: 0,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lớp phủ trắng trong suốt
            backdropFilter: 'blur(2px)', // Làm mờ nhẹ nền
            zIndex: 1
          }
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