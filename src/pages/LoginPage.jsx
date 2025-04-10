import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function LoginPage() {
  return (
    <Paper 
      elevation={6} 
      sx={{ 
        padding: { xs: 3, md: 4 },
        width: '100%', 
        maxWidth: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 2 
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center" 
        sx={{ mb: 3, fontWeight: '500' }}
      >
        Đăng Nhập
      </Typography>
      
      <Box component="form" noValidate autoComplete="off">
        <TextField
          label="Tên đăng nhập hoặc Email"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        
        <Button
          type="submit"
          variant="contained" 
          color="primary"
          fullWidth
          size="large"
          sx={{ 
            mt: 3,
            mb: 2,
            fontWeight: 'bold'
          }}
        >
          Đăng Nhập
        </Button>
      </Box>
    </Paper>
  );
}

export default LoginPage; 