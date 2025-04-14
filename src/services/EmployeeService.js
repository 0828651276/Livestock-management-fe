// src/services/employeeService.js
import axios from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8080/api/employees";

export const employeeService = {
    getAll: async () => {
        const token = authService.getCurrentUser();
        const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res;
    },

    search: async ({ id, name }) => {
        const token = authService.getCurrentUser();
        const params = {};
        if (id) params.id = id;
        if (name) params.name = name;
        const res = await axios.get(`${API_URL}/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return res;
    },

    create: async (employeeData) => {
        const token = authService.getCurrentUser();
        return axios.post(API_URL, employeeData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    update: async (id, employeeData) => {
        const token = authService.getCurrentUser();
        return axios.put(`${API_URL}/${id}`, employeeData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    delete: async (id) => {
        const token = authService.getCurrentUser();
        return axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
