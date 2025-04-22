// services/notificationService.js
import axios from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8080/api/notifications";

export const notificationService = {
    getAll: async () => {
        const token = authService.getCurrentUser();
        const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    search: async (keyword) => {
        const token = authService.getCurrentUser();
        const res = await axios.get(`${API_URL}/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { keyword }
        });
        return res.data;
    },

    add: async (notification) => {
        const token = authService.getCurrentUser();
        const res = await axios.post(API_URL, notification, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    update: async (id, notification) => {
        const token = authService.getCurrentUser();
        const res = await axios.put(`${API_URL}/${id}`, notification, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    delete: async (id) => {
        const token = authService.getCurrentUser();
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};