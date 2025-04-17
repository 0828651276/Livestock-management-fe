import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';

const ChangePasswordForm = () => {
    const navigate = useNavigate();
    const employeeId = localStorage.getItem('employeeId');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!employeeId) {
            setMessage({ type: 'error', text: 'Không tìm thấy mã nhân viên.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
            return;
        }

        if (oldPassword === newPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không được giống mật khẩu cũ.' });
            return;
        }

        // (Tùy chọn) Kiểm tra độ mạnh mật khẩu
        // const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        // if (!strongPasswordRegex.test(newPassword)) {
        //     setMessage({
        //         type: 'error',
        //         text: 'Mật khẩu mới cần ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.',
        //     });
        //     return;
        // }

        try {
            setLoading(true);
            await employeeService.changePassword(employeeId, oldPassword, newPassword);

            // Xoá thông tin đăng nhập và chuyển về login
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('employeeId');

            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công.' });
            setTimeout(() =>
                navigate('/login'), 1000);
        } catch (error) {
            const msg = error?.response?.data?.message || 'Đã xảy ra lỗi!';
            if (
                msg.toLowerCase().includes('mật khẩu cũ không đúng') ||
                error?.response?.status === 401
            ) {
                setMessage({ type: 'error', text: 'Mật khẩu cũ không chính xác.' });
            } else {
                setMessage({ type: 'error', text: msg });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        navigate('/dashboard');
    };

    const renderPasswordField = (label, value, setValue, show, setShow, autoComplete) => (
        <TextField
            label={label}
            type={show ? 'text' : 'password'}
            fullWidth
            required
            margin="normal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete={autoComplete}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShow(!show)} edge="end">
                            {show ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Đổi mật khẩu
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {renderPasswordField('Mật khẩu cũ', oldPassword, setOldPassword, showOldPassword, setShowOldPassword, 'current-password')}
            {renderPasswordField('Mật khẩu mới', newPassword, setNewPassword, showNewPassword, setShowNewPassword, 'new-password')}
            {renderPasswordField('Xác nhận mật khẩu', confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, 'new-password')}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleReset}
                    disabled={loading}
                >
                    Huỷ
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Xác nhận'}
                </Button>
            </Box>
        </Box>
    );
};

export default ChangePasswordForm;
