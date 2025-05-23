import apiClient from './apiClient';

const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data; // Should include user object and token
    } catch (error) {
      throw error.response ? error.response.data : new Error('Login failed');
    }
  },

  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data; // Should include user object and token
    } catch (error) {
      throw error.response ? error.response.data : new Error('Signup failed');
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data; // User object
    } catch (error) {
      // Error handling will be done by interceptor or AuthContext
      throw error;
    }
  },

  logout: async () => {
    try {
      // If your backend has a specific logout endpoint (e.g., to invalidate httpOnly cookie session)
      // const response = await apiClient.post('/auth/logout');
      // return response.data;
      // For client-side token removal, this service doesn't do much beyond what AuthContext handles
      return { message: "Logged out locally. Server logout if applicable." };
    } catch (error) {
      throw error.response ? error.response.data : new Error('Logout failed');
    }
  },

  // Add forgotPassword, resetPassword methods here if implementing
  // forgotPassword: async (email) => { ... },
  // resetPassword: async (token, newPassword) => { ... },
};

export default authService;