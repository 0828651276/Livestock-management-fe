import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography'; // Ensure Typography is imported

import LoginPage from '../pages/LoginPage';

function MainLayout() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',     
          width: '100vw',  // Chiếm toàn bộ chiều ngang
          height: '100vh', // Chiếm toàn bộ chiều dọc
          backgroundColor: '#1E8449',
          m: 0, // Bỏ margin
          p: 0  // Bỏ padding
        }}
      >
        <CssBaseline />
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 4
          }}
        >
          Livestock Management
        </Typography>
  
        <LoginPage /> 
      </Box>
    );
  }
  

export default MainLayout; 