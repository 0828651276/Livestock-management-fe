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
            // Kiểm tra và chuyển đổi định dạng dữ liệu nếu cần
            const dataToSend = {
                ...pigPenData,
                // Đảm bảo backend có thể hiểu cả caretakers là mảng
                caretakers: pigPenData.caretakers || []
            };

            const response = await axios.post(`${API_URL}/pigpens`, dataToSend, {
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
            // Kiểm tra và chuyển đổi định dạng dữ liệu nếu cần
            const dataToSend = {
                ...pigPenData,
                // Đảm bảo backend có thể hiểu cả caretakers là mảng
                caretakers: pigPenData.caretakers || []
            };

            const response = await axios.put(`${API_URL}/pigpens/${id}`, dataToSend, {
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
    },

    // Tìm kiếm chuồng nuôi theo nhiều tiêu chí
    searchPigPens: async (params) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/search`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuồng nuôi:', error);
            throw error;
        }
    },

    // Tìm kiếm chuồng nuôi theo tên
    searchByName: async (name) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/search/name`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { name }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuồng nuôi theo tên:', error);
            throw error;
        }
    },

    // Tìm kiếm chuồng nuôi theo khoảng thời gian tạo
    searchByDateRange: async (from, to) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/search/date`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { from, to }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuồng nuôi theo ngày tạo:', error);
            throw error;
        }
    },

    // Tìm kiếm chuồng nuôi theo ID người chăm sóc
    findByCaretakerId: async (caretakerId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/search/caretaker/${caretakerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi tìm kiếm chuồng nuôi theo người chăm sóc #${caretakerId}:`, error);
            throw error;
        }
    },

    // Tìm kiếm chuồng nuôi theo khoảng số lượng
    searchByQuantityRange: async (min, max) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pigpens/search/quantity`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { min, max }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuồng nuôi theo số lượng:', error);
            throw error;
        }
    }
};