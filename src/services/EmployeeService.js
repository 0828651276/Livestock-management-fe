// src/services/employeeService.js
import axios from "axios";
import {authService} from "./authService";

const API_URL = "http://localhost:8080/api/employees";

export const employeeService = {
    getAll: async () => {
        const token = authService.getCurrentUser();
        const res = await axios.get(API_URL, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return res;
    },

    getById: async (id) => {
        const token = authService.getCurrentUser();
        const res = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res;
    },


    search: async ({id, name}) => {
        const token = authService.getCurrentUser();
        const params = {};
        if (id) params.id = id;
        if (name) params.name = name;
        const res = await axios.get(`${API_URL}/search`, {
            headers: {Authorization: `Bearer ${token}`},
            params,
        });
        return res;
    },

    create: (formData) =>
        axios.post(`${API_URL}/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    update: async (id, formData) => {
        const token = authService.getCurrentUser();
        return axios.put(`${API_URL}/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    },


    delete: async (id) => {
        const token = authService.getCurrentUser();
        return axios.delete(`${API_URL}/${id}`, {
            headers: {Authorization: `Bearer ${token}`},
        });
    },

    changePassword: async (employeeId, oldPassword, newPassword) => {
        const token = authService.getCurrentUser();
        return axios.post(`${API_URL}/${employeeId}/change-password`, null, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                oldPassword,
                newPassword,
            },
        });
    }

};