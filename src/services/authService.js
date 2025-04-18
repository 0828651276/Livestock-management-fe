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
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      
      // Store token in localStorage for future requests
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('employeeId', data.employeeId);
        localStorage.setItem('role', data.role);
        return data;
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid username or password')) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      } else if (error.message.includes('Account is locked')) {
        throw new Error('Tài khoản đã bị khóa');
      } else if (error.message.includes('Account is disabled')) {
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại sau');
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('role');
    localStorage.setItem('loggedOut', 'true');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token;
  },

  getUserInfo: () => {
    try {
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');
      if (username) {
        return { username, role };
      }
      return { username: 'User', role: null };
    } catch (error) {
      console.error('Error getting user info:', error);
      return { username: 'User', role: null };
    }
  },

  getRole: () => {
    return localStorage.getItem('role');
  },

  // Helper method to get auth header for API calls
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;