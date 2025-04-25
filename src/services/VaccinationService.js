import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/vaccinations';

export const getAllVaccinations = async () => {
    const token = authService.getCurrentUser();
    return axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

// Thêm mới
export const createVaccination = async (data) => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.post(`${API_URL}`, data, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Thêm tiêm phòng thành công:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm tiêm phòng:", error);
        throw error;
    }
};

// Cập nhật
export const updateVaccination = async (id, data) => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.put(`${API_URL}/${id}`, data, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Cập nhật tiêm phòng thành công:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật tiêm phòng:", error);
        throw error;
    }
};

// Xoá
export const deleteVaccination = async (id) => {
    try {
        const token = authService.getCurrentUser();
        await axios.delete(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Xoá tiêm phòng thành công!");
    } catch (error) {
        console.error("Lỗi khi xoá tiêm phòng:", error);
        throw error;
    }
};