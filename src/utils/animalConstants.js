// Các hằng số liên quan đến trạng thái sức khỏe
export const healthStatus = {
    ACTIVE: {
        label: 'Khỏe Mạnh',
        color: 'success' // màu xanh lá trong MUI
    },
    SICK: {
        label: 'Bị bệnh',
        color: 'error' // màu đỏ trong MUI
    }
};

// Các hằng số liên quan đến trạng thái nuôi
export const raisingStatus = {
    RAISING: {
        label: 'Đang nuôi',
        color: 'primary' // màu xanh dương trong MUI
    },
    EXPORTED: {
        label: 'Đã xuất',
        color: 'secondary' // màu tím trong MUI hoặc màu thứ cấp
    }
};

// Hàm lấy thông tin hiển thị của trạng thái sức khỏe
export const getHealthStatusInfo = (status) => {
    return healthStatus[status] || { label: status, color: 'default' };
};

// Hàm lấy thông tin hiển thị của trạng thái nuôi
export const getRaisingStatusInfo = (status) => {
    return raisingStatus[status] || { label: status, color: 'default' };
};