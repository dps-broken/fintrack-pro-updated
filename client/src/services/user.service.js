import apiClient from './apiClient';

const userService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile'); // Or rely on /auth/me
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update profile');
    }
  },

  updatePassword: async (passwordData) => {
    // passwordData should be { currentPassword, newPassword }
    try {
      const response = await apiClient.put('/users/password', passwordData);
      return response.data; // Usually just a success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update password');
    }
  },

  updateThemePreference: async (theme) => {
    try {
      const response = await apiClient.put('/users/theme', { theme });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update theme');
    }
  },

  updateEmailPreferences: async (preferences) => {
    // preferences should be { dailyReport, monthlyReport, budgetAlerts }
    try {
      const response = await apiClient.put('/users/email-preferences', preferences);
      return response.data;
    } catch (error)
    {
      throw error.response ? error.response.data : new Error('Failed to update email preferences');
    }
  },

  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/users/account');
      return response.data; // Success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete account');
    }
  }
};

export default userService;