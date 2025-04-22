import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert } from '@mui/material';
import { notificationService } from '../../services/NotificationService';

const UpdateNotificationForm = ({ open, onClose, notification, onUpdated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setContent(notification?.content || '');
        setError('');
    }, [notification, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!content.trim()) {
            setError('Nội dung không được để trống');
            return;
        }
        setLoading(true);
        try {
            await notificationService.update(notification.id, { ...notification, content });
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            setError('Cập nhật thông báo thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cập nhật thông báo</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box mb={2}>
                        <TextField
                            label="Nội dung thông báo"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            required
                        />
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Hủy</Button>
                    <Button type="submit" variant="contained" disabled={loading}>Cập nhật</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdateNotificationForm;
