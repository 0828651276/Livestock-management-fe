import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

export const pigPenService = {
    // Lấy danh sách tất cả chuồng nuôi từ backend
    getAllPigPens: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chuồng nuôi:', error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết một chuồng nuôi
    getPigPen: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin chuồng nuôi #${id}:`, error);
            throw error;
        }
    },

    // Tạo chuồng nuôi mới
    createPigPen: async (pigPenData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.post(`${API_URL}/pigpens`, pigPenData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo chuồng nuôi mới:', error);
            throw error;
        }
    },

    // Cập nhật thông tin chuồng nuôi
    updatePigPen: async (id, pigPenData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.put(`${API_URL}/pigpens/${id}`, pigPenData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật chuồng nuôi #${id}:`, error);
            throw error;
        }
    },

    // Xóa chuồng nuôi
    deletePigPen: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.delete(`${API_URL}/pigpens/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa chuồng nuôi #${id}:`, error);
            throw error;
        }
    }
};