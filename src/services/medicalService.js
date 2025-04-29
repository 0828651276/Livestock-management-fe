import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/medical';

export const medicalService = {
    // Get all medical records
    getAllMedical: async () => {
        const token = authService.getCurrentUser();
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Create new medical record
    createMedical: async (medicalData) => {
        const token = authService.getCurrentUser();
        const response = await axios.post(API_URL, medicalData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Update medical record
    updateMedical: async (id, medicalData) => {
        const token = authService.getCurrentUser();
        const response = await axios.put(`${API_URL}/${id}`, medicalData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Delete medical record
    deleteMedical: async (id) => {
        const token = authService.getCurrentUser();
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Lấy medical records theo status
    getByStatus: async (status) => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/status/${status}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Lấy medical records theo animal và status
    getByAnimalAndStatus: async (pigId, status) => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/animal/${pigId}/status/${status}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Lấy medical records theo animal
    getByAnimal: async (pigId) => {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/animal/${pigId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}; 