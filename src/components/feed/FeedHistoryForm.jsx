import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { Close, Save, RestaurantMenu } from '@mui/icons-material';
import { feedHistoryService } from '../../services/feedHistoryService';
import { animalService } from '../../services/animalService';
import { feedPlanService } from '../../services/feedPlanService';

const FeedHistoryForm = ({ open, onClose, pigPen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [feedPlans, setFeedPlans] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    pigPenId: '',
    animalId: '',
    feedPlanId: '',
    feedAmount: '',
    feedingTime: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [loadingFeedPlans, setLoadingFeedPlans] = useState(false);

  useEffect(() => {
    if (open && pigPen) {
      setFormData({
        ...formData,
        pigPenId: pigPen.penId
      });
      fetchAnimals(pigPen.penId);
      fetchFeedPlans();
    }
  }, [open, pigPen]);

  const fetchAnimals = async (penId) => {
    if (!penId) return;
    
    setLoadingAnimals(true);
    try {
      const response = await animalService.getAnimalsByPenId(penId);
      const animalList = Array.isArray(response) ? response : response.content || [];
      setAnimals(animalList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách động vật:", error);
      showNotification("Không thể tải danh sách động vật", "error");
    } finally {
      setLoadingAnimals(false);
    }
  };

  const fetchFeedPlans = async () => {
    setLoadingFeedPlans(true);
    try {
      const response = await feedPlanService.getAllFeedPlans();
      const feedPlanList = Array.isArray(response) ? response : response.content || [];
      setFeedPlans(feedPlanList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách kế hoạch cho ăn:", error);
      showNotification("Không thể tải danh sách kế hoạch cho ăn", "error");
    } finally {
      setLoadingFeedPlans(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.animalId || !formData.feedPlanId || !formData.feedAmount || !formData.feedingTime) {
      showNotification("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setLoading(true);
    try {
      await feedHistoryService.createFeedHistory(formData);
      showNotification("Tạo lịch sử cho ăn thành công", "success");
      
      // Reset form
      setFormData({
        pigPenId: pigPen?.penId || '',
        animalId: '',
        feedPlanId: '',
        feedAmount: '',
        feedingTime: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi tạo lịch sử cho ăn:", error);
      showNotification("Không thể tạo lịch sử cho ăn", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={loading ? null : onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <RestaurantMenu sx={{ mr: 1 }} />
            Tạo lịch sử cho ăn
          </Typography>
          {!loading && (
            <Button 
              onClick={onClose}
              color="inherit"
              size="small"
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Close />
            </Button>
          )}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Chuồng: {pigPen?.name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={loadingAnimals}>
                  <InputLabel id="animal-select-label">Động vật</InputLabel>
                  <Select
                    labelId="animal-select-label"
                    id="animalId"
                    name="animalId"
                    value={formData.animalId}
                    onChange={handleChange}
                    label="Động vật"
                  >
                    {loadingAnimals ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Đang tải...
                      </MenuItem>
                    ) : animals.length > 0 ? (
                      animals.map((animal) => (
                        <MenuItem key={animal.id} value={animal.id}>
                          {animal.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Không có động vật</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={loadingFeedPlans}>
                  <InputLabel id="feed-plan-select-label">Kế hoạch cho ăn</InputLabel>
                  <Select
                    labelId="feed-plan-select-label"
                    id="feedPlanId"
                    name="feedPlanId"
                    value={formData.feedPlanId}
                    onChange={handleChange}
                    label="Kế hoạch cho ăn"
                  >
                    {loadingFeedPlans ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Đang tải...
                      </MenuItem>
                    ) : feedPlans.length > 0 ? (
                      feedPlans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Không có kế hoạch cho ăn</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  id="feedAmount"
                  name="feedAmount"
                  label="Lượng thức ăn"
                  type="number"
                  value={formData.feedAmount}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  id="feedingTime"
                  name="feedingTime"
                  label="Thời gian cho ăn"
                  type="datetime-local"
                  value={formData.feedingTime}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Ghi chú"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={onClose} 
              color="inherit" 
              disabled={loading}
              startIcon={<Close />}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedHistoryForm;
