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
            // Chuyển đổi dữ liệu người chăm sóc thành định dạng phù hợp
            const dataToSend = {
                ...pigPenData,
                caretakers: pigPenData.caretakers.map(caretaker => ({
                    employeeId: caretaker.employeeId,
                    fullName: caretaker.fullName
                }))
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
            // Chuyển đổi dữ liệu người chăm sóc thành định dạng phù hợp
            const dataToSend = {
                ...pigPenData,
                caretakers: pigPenData.caretakers.map(caretaker => ({
                    employeeId: caretaker.employeeId,
                    fullName: caretaker.fullName
                }))
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

    // Tìm kiếm chuồng nuôi theo khoảng thời gian và nhân viên chăm sóc
    searchByDateRangeAndCaretaker: async (from, to, caretakerId) => {
        try {
            const token = authService.getCurrentUser();
            // Đầu tiên lấy theo khoảng thời gian
            const dateResponse = await axios.get(`${API_URL}/pigpens/search/date`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: { from, to }
            });

            // Sau đó lọc theo caretakerId nếu được cung cấp
            if (caretakerId) {
                // Lọc các chuồng mà nhân viên này chăm sóc
                return dateResponse.data.filter(pen =>
                    (pen.caretaker && pen.caretaker.employeeId === caretakerId) ||
                    (pen.caretakers && pen.caretakers.some(c => c.employeeId === caretakerId))
                );
            }

            return dateResponse.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuồng nuôi theo ngày và người chăm sóc:', error);
            throw error;
        }
    },

    // Tìm kiếm chuồng nuôi theo ID người chăm sóc (API mới)
    findByCaretakerId: async (employeeId) => {
        try {
            const token = authService.getCurrentUser(); // Giữ nguyên nếu bạn lấy token từ đây
            const response = await axios.get(`${API_URL}/pigpens/my-pens`, {
                params: { employeeId },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi tìm kiếm chuồng nuôi theo người chăm sóc #${employeeId}:`, error);
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