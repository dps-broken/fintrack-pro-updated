import apiClient from './apiClient';

const analyticsService = {
  getDashboardSummary: async (params = {}) => { // { period, startDate, endDate }
    try {
      const response = await apiClient.get('/analytics/dashboard-summary', { params });
      return response.data; // { totalIncome, totalExpense, currentBalance, period }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch dashboard summary');
    }
  },

  getCategorySpending: async (params = {}) => { // { period, startDate, endDate, limit }
    try {
      const response = await apiClient.get('/analytics/category-spending', { params });
      return response.data; // Array of { categoryName, totalSpent, categoryIcon, categoryColor }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch category spending');
    }
  },

  getIncomeExpenseTrends: async (params = {}) => { // { type, granularity, period, startDate, endDate }
    try {
      const response = await apiClient.get('/analytics/trends', { params });
      return response.data; // Array of { date, amount }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch trends');
    }
  },

  getSavingsRatio: async (params = {}) => { // { period, startDate, endDate }
    try {
      const response = await apiClient.get('/analytics/savings-ratio', { params });
      return response.data; // { totalIncome, totalExpense, savings, savingsRatio, expenseRatio, period }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch savings ratio');
    }
  },
};

export default analyticsService;