import React, { useEffect, useState } from 'react';
import {
    Card, CardContent, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
    IconButton, Snackbar, Alert, CircularProgress, Box
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

import {
    getAllVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,
} from '../../services/VaccinationService';
import VaccinationForm from './VaccinationForm';
import VaccinationUpdateForm from './VaccinationUpdateForm';

export default function VaccinationList() {
    const [vaccinations, setVaccinations] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState(null);
    const [form, setForm] = useState({ id: null, date: '', vaccineType: '', note: '', pen: { id: '' } });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getAllVaccinations();
            setVaccinations(res.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
            setNotification({
                open: true,
                message: 'Không thể tải danh sách tiêm phòng. Vui lòng thử lại sau.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openDialog = () => {
        setForm({ id: null, date: '', vaccineType: '', note: '', pen: { id: '' } });
        setDialogOpen(true);
    };

    const openUpdateDialog = (vaccination) => {
        setSelectedVaccination(vaccination);
        setUpdateDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            await createVaccination(form);
            setNotification({
                open: true,
                message: 'Thêm lịch tiêm phòng thành công',
                severity: 'success'
            });
            setDialogOpen(false);
            loadData();
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            setNotification({
                open: true,
                message: 'Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.',
                severity: 'error'
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xoá?')) {
            try {
                await deleteVaccination(id);
                setNotification({
                    open: true,
                    message: 'Xóa lịch tiêm phòng thành công',
                    severity: 'success'
                });
                loadData();
            } catch (err) {
                console.error('Lỗi khi xóa:', err);
                setNotification({
                    open: true,
                    message: 'Có lỗi xảy ra khi xóa dữ liệu. Vui lòng thử lại.',
                    severity: 'error'
                });
            }
        }
    };

    const getStatusColor = (date) => {
        const today = new Date().toISOString().split('T')[0];
        if (date === today) return 'gold';
        if (date < today) return 'lightcoral';
        return 'lightgreen';
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <Card className="m-4">
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Lịch Tiêm Phòng
                </Typography>

                <Button variant="contained" onClick={openDialog} sx={{ mb: 2 }}>
                    ➕ Thêm Lịch Tiêm
                </Button>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ngày tiêm</TableCell>
                                <TableCell>Loại vaccine</TableCell>
                                <TableCell>Ghi chú</TableCell>
                                <TableCell>Chuồng</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : vaccinations.length > 0 ? (
                                vaccinations.map((v) => (
                                    <TableRow key={v.id} style={{ backgroundColor: getStatusColor(v.date) }}>
                                        <TableCell>{v.date}</TableCell>
                                        <TableCell>{v.vaccineType}</TableCell>
                                        <TableCell>{v.note}</TableCell>
                                        <TableCell>{v.pen?.id}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => openUpdateDialog(v)}><Edit /></IconButton>
                                            <IconButton onClick={() => handleDelete(v.id)}><Delete /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">Không có dữ liệu.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Form thêm mới */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
                    <DialogTitle>Thêm Lịch Tiêm</DialogTitle>
                    <VaccinationForm
                        form={form}
                        setForm={setForm}
                        onSave={handleSave}
                        onCancel={() => setDialogOpen(false)}
                    />
                </Dialog>

                {/* Form cập nhật */}
                <VaccinationUpdateForm
                    open={updateDialogOpen}
                    vaccination={selectedVaccination}
                    onSuccess={() => {
                        setUpdateDialogOpen(false);
                        loadData();
                        setNotification({
                            open: true,
                            message: 'Cập nhật lịch tiêm phòng thành công',
                            severity: 'success'
                        });
                    }}
                    onCancel={() => setUpdateDialogOpen(false)}
                />

                {/* Thông báo */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
}
