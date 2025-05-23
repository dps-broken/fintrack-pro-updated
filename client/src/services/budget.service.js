import apiClient from './apiClient';

const budgetService = {
  createBudget: async (budgetData) => {
    try {
      const response = await apiClient.post('/budgets', budgetData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create budget');
    }
  },

  getBudgets: async (filters = {}) => { // e.g., { period, category, active }
    try {
      const response = await apiClient.get('/budgets', { params: filters });
      return response.data; // Array of budgets, potentially with spending status
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budgets');
    }
  },

  getBudgetById: async (id) => {
    try {
      const response = await apiClient.get(`/budgets/${id}`);
      return response.data; // Budget with spending status
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budget');
    }
  },

  getBudgetStatus: async (id) => {
    try {
        const response = await apiClient.get(`/budgets/${id}/status`);
        return response.data; // { budgetId, name, amount, totalSpent, progress, remaining }
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch budget status');
    }
  },

  updateBudget: async (id, budgetData) => {
    try {
      const response = await apiClient.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update budget');
    }
  },

  deleteBudget: async (id) => {
    try {
      const response = await apiClient.delete(`/budgets/${id}`);
      return response.data; // Success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete budget');
    }
  },
};

export default budgetService;