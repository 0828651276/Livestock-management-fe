import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/animals';

export const animalService = {
    // Lấy tất cả động vật
    getAll: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách động vật:', error);
            throw error;
        }
    },

    // Lấy chi tiết một động vật
    getById: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin động vật #${id}:`, error);
            throw error;
        }
    },

    // Tạo động vật mới
    create: async (animalData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.post(API_URL, animalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo động vật mới:', error);
            throw error;
        }
    },

    // Cập nhật thông tin động vật
    update: async (id, animalData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.put(`${API_URL}/${id}`, animalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật động vật #${id}:`, error);
            throw error;
        }
    },

    // Xóa động vật
    delete: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa động vật #${id}:`, error);
            throw error;
        }
    },

    // Tìm kiếm động vật theo nhiều tiêu chí
    search: async (params) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/search`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm động vật:', error);
            throw error;
        }
    },

    // Lấy danh sách động vật theo chuồng
    getByPenId: async (penId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pen/${penId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy động vật theo chuồng #${penId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách động vật theo trạng thái sức khỏe
    getByHealthStatus: async (healthStatus) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/health-status/${healthStatus}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy động vật theo trạng thái sức khỏe ${healthStatus}:`, error);
            throw error;
        }
    },

    // Lấy danh sách động vật theo trạng thái nuôi
    getByRaisingStatus: async (raisingStatus) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/raising-status/${raisingStatus}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy động vật theo trạng thái nuôi ${raisingStatus}:`, error);
            throw error;
        }
    },

    // Xuất chuồng động vật
    exportAnimal: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.post(`${API_URL}/${id}/export`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xuất chuồng động vật #${id}:`, error);
            throw error;
        }
    },

    // Lấy danh sách động vật đã xuất chuồng
    getExported: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/exported`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách động vật đã xuất chuồng:', error);
            throw error;
        }
    }
};

export default animalService;