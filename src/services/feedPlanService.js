import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/plan';

export const feedPlanService = {
    createFeedPlan: async (feedPlan) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.post(API_URL, feedPlan, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo khẩu phần ăn:', error);
            throw error;
        }
    },

    updateFeedPlan: async (feedPlanId, feedPlan) => {
        try {
            const token = authService.getCurrentUser();
            return axios.put(`${API_URL}/${feedPlanId}`, feedPlan, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật khẩu phần:', error);
            throw error;
        }
    },

    getAllFeedPlans: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách khẩu phần:', error);
            throw error;
        }
    },

    getDailyFeedSummary: async () => {
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
    },

    getPenDailyFeedPlan: async (penId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pen/${penId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy khẩu phần ăn hàng ngày cho chuồng:', error);
            throw error;
        }
    },

    searchByPenName: async (penName) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/search`, {
                params: {
                    penName: penName
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm khẩu phần theo tên chuồng:', error);
            throw error;
        }
    },

    deleteFeedPlan: async (feedPlanId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.delete(`${API_URL}/${feedPlanId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi xóa khẩu phần ăn:', error);
            throw error;
        }
    }
};

// Để hỗ trợ các code cũ vẫn hoạt động
export const createFeedPlan = feedPlanService.createFeedPlan;
export const updateFeedPlan = feedPlanService.updateFeedPlan;
export const getAllFeedPlans = feedPlanService.getAllFeedPlans;
export const getDailyFeedSummary = feedPlanService.getDailyFeedSummary;
export const searchByPenName = feedPlanService.searchByPenName;