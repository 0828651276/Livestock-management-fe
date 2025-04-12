// import axios from 'axios';
// import { authService } from './authService';
//
// const API_URL = 'http://localhost:8080/api';
//
// export const employeeService = {
//     // Lấy danh sách tất cả nhân viên từ backend
//     getAllEmployees: async () => {
//         try {
//             const token = authService.getCurrentUser();
//             const response = await axios.get(`${API_URL}/employees`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error('Lỗi khi lấy danh sách nhân viên:', error);
//             throw error;
//         }
//     },
//
//     // Tìm kiếm nhân viên theo ID hoặc tên
//     searchEmployees: async (id, name) => {
//         try {
//             const token = authService.getCurrentUser();
//             const params = {};
//             if (id) params.id = id;
//             if (name) params.name = name;
//
//             const response = await axios.get(`${API_URL}/employees/search`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 params
//             });
//             return response.data;
//         } catch (error) {
//             console.error('Lỗi khi tìm kiếm nhân viên:', error);
//             throw error;
//         }
//     },
//
//     // Lấy thông tin chi tiết một nhân viên
//     getEmployee: async (id) => {
//         try {
//             const token = authService.getCurrentUser();
//             const response = await axios.get(`${API_URL}/employees/${id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error(`Lỗi khi lấy thông tin nhân viên #${id}:`, error);
//             throw error;
//         }
//     },
//
//     // Tạo nhân viên mới
//     createEmployee: async (employeeData) => {
//         try {
//             const token = authService.getCurrentUser();
//             const response = await axios.post(`${API_URL}/employees`, employeeData, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error('Lỗi khi tạo nhân viên mới:', error);
//             throw error;
//         }
//     },
//
//     // Cập nhật thông tin nhân viên
//     updateEmployee: async (id, employeeData) => {
//         try {
//             const token = authService.getCurrentUser();
//             const response = await axios.put(`${API_URL}/employees/${id}`, employeeData, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error(`Lỗi khi cập nhật nhân viên #${id}:`, error);
//             throw error;
//         }
//     },
//
//     // Xóa nhân viên
//     deleteEmployee: async (id) => {
//         try {
//             const token = authService.getCurrentUser();
//             const response = await axios.delete(`${API_URL}/employees/${id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error(`Lỗi khi xóa nhân viên #${id}:`, error);
//             throw error;
//         }
//     }
// };