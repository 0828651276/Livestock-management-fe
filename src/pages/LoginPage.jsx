import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { authService } from '../services/authService';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';

function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { username, password } = credentials;
      
      if (!username || !password) {
        setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
        setLoading(false);
        return;
      }

      await authService.login(username, password);
      
      // Redirect or handle successful login
      window.location.href = '/dashboard';
    } catch (error) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      console.error('Login submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={6} 
      sx={{ 
        padding: { xs: 3, md: 5 },
        width: '100%', 
        maxWidth: 500,
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        borderRadius: 2,
        color: 'white',
        position: 'relative',
        minHeight: 600
      }}
    >
      <div className="close-button">
        <CloseIcon fontSize="small" />
      </div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <img src="/src/assets/pig-icon.svg" alt="Pig Icon" width="120" height="120" />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          placeholder="TÊN TÀI KHOẢN"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          variant="filled"
          fullWidth
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </InputAdornment>
            ),
            sx: { 
              backgroundColor: 'rgba(60, 60, 60, 0.8)', 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(70, 70, 70, 0.8)'
              },
              '& .MuiFilledInput-input': {
                color: 'white',
                padding: '16px 14px'
              }
            }
          }}
          sx={{ mb: 3 }}
        />
        
        <TextField
          placeholder="MẬT KHẨU"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          variant="filled"
          fullWidth
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </InputAdornment>
            ),
            sx: { 
              backgroundColor: 'rgba(60, 60, 60, 0.8)', 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(70, 70, 70, 0.8)'
              },
              '& .MuiFilledInput-input': {
                color: 'white',
                padding: '16px 14px'
              }
            }
          }}
          sx={{ mb: 4 }}
        />
        
        <Button
          type="submit"
          variant="contained" 
          fullWidth
          size="large"
          disabled={loading}
          sx={{ 
            mt: 3,
            mb: 2,
            fontWeight: 'bold',
            height: 56,
            backgroundColor: '#E75A99',
            '&:hover': {
              backgroundColor: '#D4337F'
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'ĐĂNG NHẬP'}
        </Button>
      </Box>
    </Paper>
  );
}

export default LoginPage;