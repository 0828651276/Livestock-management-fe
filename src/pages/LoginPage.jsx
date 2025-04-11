import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { authService } from '../services/authService';

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
      
      console.log('Form submission with credentials:', { username, password });

      // For debugging - log what format Postman uses
      console.log('Expected request format (should match Postman):', 
                  JSON.stringify({ username, password }));

      await authService.login(username, password);
      
      // Redirect or handle successful login
      window.location.href = '/dashboard'; // You'll need to create this page later
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
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          label="Tên đăng nhập"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Mật khẩu"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
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
          disabled={loading}
          sx={{ 
            mt: 3,
            mb: 2,
            fontWeight: 'bold',
            height: 48
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập'}
        </Button>
      </Box>
    </Paper>
  );
}

export default LoginPage;