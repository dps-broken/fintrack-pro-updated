import apiClient from './apiClient';

const transactionService = {
  addTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add transaction');
    }
  },

  getTransactions: async (filters = {}) => {
    // filters: { page, limit, sortBy, order, type, category, startDate, endDate, minAmount, maxAmount, search }
    try {
      const response = await apiClient.get('/transactions', { params: filters });
      return response.data; // { transactions, currentPage, totalPages, totalTransactions }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transactions');
    }
  },

  getTransactionById: async (id) => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transaction');
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const response = await apiClient.put(`/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update transaction');
    }
  },

  deleteTransaction: async (id) => {
    try {
      const response = await apiClient.delete(`/transactions/${id}`);
      return response.data; // Usually a success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete transaction');
    }
  },
};

export default transactionService;