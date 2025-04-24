import axios from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8080/api/feedwarehouse";

// Lấy danh sách tồn kho thức ăn
export const fetchFeedInventory = async () => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tồn kho:", error);
        throw error;
    }
};

// Tìm kiếm thức ăn trong kho theo từ khóa
export const searchFeedInventory = async (keyword) => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { keyword }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm thức ăn:", error);
        throw error;
    }
};

// Nhập thêm thức ăn vào kho
export const importFeed = async (feedRequest) => {
    try {
        const token = authService.getCurrentUser();
        await axios.post(`${API_URL}/import`, feedRequest, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Lỗi khi nhập thức ăn:", error);
        throw error;
    }
};

// Xuất thức ăn khỏi kho
export const exportFeed = async (feedRequest) => {
    try {
        const token = authService.getCurrentUser();
        await axios.post(`${API_URL}/export`, feedRequest, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Lỗi khi xuất thức ăn:", error);
        throw error;
    }
};

// Lấy danh sách giao dịch theo loại thức ăn
export const fetchTransactionsByFeedType = async (feedType) => {
    try {
        const token = authService.getCurrentUser();
        const response = await axios.get(`${API_URL}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { feedType }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giao dịch theo loại:", error);
        throw error;
    }
};

// Lọc giao dịch theo nhiều điều kiện
export const getFilteredTransactions = async ({ feedType, transactionType, startDate, endDate }) => {
    try {
        const token = authService.getCurrentUser();
        const params = new URLSearchParams();
        
        // Thêm các tham số lọc nếu có giá trị
        if (feedType) params.append('feedType', feedType);
        if (transactionType) params.append('transactionType', transactionType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        console.log("Tham số lọc:", params.toString());

        const response = await axios.get(`${API_URL}/transactions?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Dữ liệu trả về:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giao dịch:", error);
        throw error;
    }
};

export const fetchTransactionsByFeed = async (feedType, transactionType, startDate, endDate) => {
    try {
        const params = {};
        if (feedType) params.feedType = feedType;
        if (transactionType) params.transactionType = transactionType;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${API_URL}/transactions`, { params });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giao dịch:", error);
        throw error;
    }
};