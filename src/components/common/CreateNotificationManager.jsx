import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert } from '@mui/material';
import { notificationService } from '../../services/NotificationService';

const CreateNotificationForm = ({ open, onClose, onCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!content.trim()) {
            setError('Nội dung không được để trống');
            return;
        }
        setLoading(true);
        try {
            await notificationService.add({ content });
            if (onCreated) onCreated();
            setContent('');
            onClose();
        } catch (err) {
            setError('Thêm thông báo thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setContent('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm mới thông báo</DialogTitle>
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
                    <Button type="submit" variant="contained" disabled={loading}>Thêm</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateNotificationForm;
