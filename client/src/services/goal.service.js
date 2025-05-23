import apiClient from './apiClient';

const goalService = {
  createGoal: async (goalData) => {
    try {
      const response = await apiClient.post('/goals', goalData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create goal');
    }
  },

  getGoals: async (filters = {}) => { // e.g., filters = { isAchieved: true/false }
    try {
      const response = await apiClient.get('/goals', { params: filters });
      return response.data; // Array of goals
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch goals');
    }
  },

  getGoalById: async (id) => {
    try {
      const response = await apiClient.get(`/goals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch goal');
    }
  },

  updateGoal: async (id, goalData) => {
    try {
      const response = await apiClient.put(`/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update goal');
    }
  },

  updateGoalProgress: async (id, currentAmount) => {
    try {
      const response = await apiClient.patch(`/goals/${id}/progress`, { currentAmount });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update goal progress');
    }
  },

  deleteGoal: async (id) => {
    try {
      const response = await apiClient.delete(`/goals/${id}`);
      return response.data; // Success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete goal');
    }
  },
};

export default goalService;