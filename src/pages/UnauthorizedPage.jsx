import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';

function UnauthorizedPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: 500,
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: 2
        }}
      >
        <ErrorIcon sx={{ fontSize: 70, color: '#d32f2f', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ color: '#d32f2f' }}>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </Typography>
        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Quay lại Dashboard
        </Button>
      </Paper>
    </Box>
  );
}

export default UnauthorizedPage;