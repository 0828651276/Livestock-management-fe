// Authentication service to handle login and token management
const API_URL = 'http://localhost:8080/api'; // Exact URL used in Postman

export const authService = {
  login: async (username, password, employeeId) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage for future requests
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Lưu thêm tên đăng nhập để hiển thị
        localStorage.setItem('username', username);
        // Lưu mã nhân viên
        localStorage.setItem('employeeId', data.employeeId); // Lưu mã nhân viên

        return data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('employeeId')
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token;
  },

  getUserInfo: () => {
    try {
      const username = localStorage.getItem('username');
      if (username) {
        return { username };
      }
      return { username: 'User' };
    } catch (error) {
      console.error('Error getting user info:', error);
      return { username: 'User' };
    }
  },

  // Helper method to get auth header for API calls
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;