import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

export const medicalService = {
    // Lấy toàn bộ lịch sử chữa trị (không phân trang)
    getAllTreatments: async () => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/medical-treatments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data; // List<MedicalTreatmentDTO>
    },

    // Lấy lịch sử chữa trị có phân trang (nếu backend trả về Page<DTO>)
    getTreatmentsPaged: async (page = 0, size = 10) => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/medical-treatments/page`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { page, size }
        });
        return response.data; // Page<MedicalTreatmentDTO>
    },

    // Lấy thông tin một ca chữa trị theo ID
    getTreatmentById: async (id) => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/medical-treatments/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // Lấy danh sách động vật cần điều trị (SICK hoặc UNVACCINATED)
    getSickOrUnvaccinatedAnimals: async () => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/medical-treatments/animals/sick_or_unvaccinated`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // Tạo mới ca chữa trị
    createTreatment: async (treatmentData) => {
        const token = authService.getCurrentUser();
        const response = await axios.post(`${API_URL}/medical-treatments`, treatmentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Cập nhật ca chữa trị
    updateTreatment: async (id, treatmentData) => {
        const token = authService.getCurrentUser();
        const response = await axios.put(`${API_URL}/medical-treatments/${id}`, treatmentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Xóa ca chữa trị
    deleteTreatment: async (id) => {
        const token = authService.getCurrentUser();
        await axios.delete(`${API_URL}/medical-treatments/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

export default medicalService;