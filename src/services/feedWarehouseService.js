import axios from "axios";

const API_URL = "http://localhost:8080/api/feedwarehouse";

// Lấy danh sách tồn kho thức ăn
export const fetchFeedInventory = async () => {
    try {
        const response = await axios.get(`${API_URL}/inventory`);
        return response.data;  // Dữ liệu sẽ là mảng FeedInventoryDTO
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tồn kho:", error);
        throw error;
    }
};

// Tìm kiếm thức ăn trong kho theo từ khóa
export const searchFeedInventory = async (keyword) => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { keyword },
        });
        return response.data;  // Dữ liệu sẽ là mảng FeedInventoryDTO
    } catch (error) {
        console.error("Lỗi khi tìm kiếm thức ăn:", error);
        throw error;
    }
};

// Nhập thêm thức ăn vào kho
export const importFeed = async (feedRequest) => {
    try {
        await axios.post(`${API_URL}/import`, feedRequest);
    } catch (error) {
        console.error("Lỗi khi nhập thức ăn:", error);
        throw error;
    }
};

// Xuất thức ăn khỏi kho
export const exportFeed = async (feedRequest) => {
    try {
        await axios.post(`${API_URL}/export`, feedRequest);
    } catch (error) {
        console.error("Lỗi khi xuất thức ăn:", error);
        throw error;
    }
};
