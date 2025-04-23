import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/plan';

export const createFeedPlan = async (feedPlan) => {
    return axios.post(`${API_URL}/`, feedPlan);
};

export const updateFeedPlan = async (id, feedPlan) => {
    return axios.put(`${API_URL}/${id}`, feedPlan);
};

export const getFeedPlanById = async (id) => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin khẩu phần:', error);
        throw error;
    }
};

export const getDailyFeedSummary = async () => {
    try {
        const token = authService.getCurrentUser();
        
        const res = await axios.get(`${API_URL}/summary`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tổng hợp khẩu phần ăn:', error);
        throw error;
    }
};
