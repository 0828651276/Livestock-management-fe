import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authService } from '../services/authService';
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

function LoginPage() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const backgroundImageUrl = 'https://i.pinimg.com/736x/dc/e3/cb/dce3cb7b2daeb86ca5bd921ae06f3b2f.jpg';
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [logoutSuccess, setLogoutSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is logged out and show success message
        if (localStorage.getItem('loggedOut')) {
            setLogoutSuccess(true);
            localStorage.removeItem('loggedOut'); // Remove the flag
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

// Trong hàm handleSubmit của LoginPage.jsx
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

        // Login sẽ tự động lưu role vào localStorage
        await authService.login(username, password);
        setSuccess(true);

        setTimeout(() => {
            navigate("/dashboard");
        }, 1000);

    } catch (error) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
        console.error('Login submission error:', error);
        setLoading(false);
    }
};

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setLogoutSuccess(false);
    };

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
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4
                        }}
                    >
                        <img
                            src="https://hienlaptop.com/wp-content/uploads/2024/11/Download-Mien-Phi-File-Vector-PNG-PSD-Hinh-Con-Heo-Dep-Doc-Dao-2.png"
                            alt="Pig Icon"
                            width="150"
                            height="150"
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
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
                            type={showPassword ? 'text' : 'password'}
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
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {showPassword
                                                ? <VisibilityOff sx={{ color: 'white' }} />
                                                : <Visibility sx={{ color: 'white' }} />}
                                        </IconButton>
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

                    <Snackbar
                        open={success}
                        autoHideDuration={2000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert
                            severity="success"
                            variant="filled"
                            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                            sx={{ width: '100%', fontSize: '16px' }}
                        >
                            Đăng nhập thành công!
                        </Alert>
                    </Snackbar>

                    <Snackbar
                        open={logoutSuccess}
                        autoHideDuration={2000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert
                            severity="success"
                            variant="filled"
                            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                            sx={{ width: '100%', fontSize: '16px' }}
                        >
                            Đăng xuất thành công!
                        </Alert>
                    </Snackbar>
                </Paper>        </Box>
        </Box>
    );
}

export default LoginPage;
