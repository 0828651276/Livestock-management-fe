import axios from 'axios';
import { authService } from './authService';
const API_URL = 'http://localhost:8080/api';

export const animalService = {
    // Get all animals from backend
    getAllAnimals: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching animals:', error);
            throw error;
        }
    },

    // Get empty pens (pens with no animals)
    getEmptyPens: async () => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/empty`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching empty pens:', error);
            throw error;
        }
    },

    // Get animals for specific employee
    getAnimalsByEmployeeId: async (employeeId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/employee/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching animals for employee #${employeeId}:`, error);
            throw error;
        }
    },

    // Get animal by ID
    getAnimal: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching animal #${id}:`, error);
            throw error;
        }
    },

    // Create new animal
    createAnimal: async (animalData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.post(`${API_URL}/animals`, animalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating animal:', error);
            throw error;
        }
    },

    // Update animal
    updateAnimal: async (id, animalData) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.put(`${API_URL}/animals/${id}`, animalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating animal #${id}:`, error);
            throw error;
        }
    },

    // Delete animal
    deleteAnimal: async (id) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.delete(`${API_URL}/animals/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting animal #${id}:`, error);
            throw error;
        }
    },

    // Xuất chuồng động vật
    exportAnimal: async (id) => {
        try {
            const token = authService.getCurrentUser();

            // Sử dụng POST đến endpoint xuất chuồng
            const response = await axios.post(`${API_URL}/animals/${id}/export`, null, {
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

    // Search animals by criteria
    searchAnimals: async (params) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/search`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error searching animals:', error);
            throw error;
        }
    },

    // Get animals by status
    getAnimalsByStatus: async (status) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/status/${status}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching animals by status ${status}:`, error);
            throw error;
        }
    },

    // Get animals by pen ID
    getAnimalsByPenId: async (penId) => {
        try {
            const token = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/animals/pen/${penId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching animals for pen #${penId}:`, error);
            throw error;
        }
    }
};