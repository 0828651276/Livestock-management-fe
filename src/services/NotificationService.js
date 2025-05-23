// services/notificationService.js
import axios from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8080/api/notifications";

export const notificationService = {
    // Lấy tất cả thông báo
    // Nếu là admin: lấy tất cả thông báo
    // Nếu là employee: backend sẽ lọc thông báo dựa vào employeeId và chuồng được chăm sóc
    getAll: async () => {
        const token = authService.getCurrentUser();
        const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // Tìm kiếm thông báo theo nội dung
    search: async (keyword) => {
        const token = authService.getCurrentUser();
        const res = await axios.get(`${API_URL}/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { content: keyword }
        });
        return res.data;
    },

    // Thêm thông báo mới với danh sách chuồng liên quan
    add: async (notification) => {
        const token = authService.getCurrentUser();
        const res = await axios.post(API_URL, notification, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // Cập nhật thông báo
    update: async (id, notification) => {
        const token = authService.getCurrentUser();

        // Đặt trạng thái read về false để reset thông báo thành "chưa đọc"
        const updatedNotification = {
            ...notification,
            read: false
        };

        const res = await axios.put(`${API_URL}/${id}`, updatedNotification, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // Xóa thông báo
    delete: async (id) => {
        const token = authService.getCurrentUser();
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (id) => {
        const token = authService.getCurrentUser();
        await axios.patch(`${API_URL}/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};