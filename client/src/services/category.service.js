import apiClient from './apiClient';

const categoryService = {
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create category');
    }
  },

  getCategories: async (type = null) => { // type can be 'income', 'expense', or null for all
    try {
      const params = type ? { type } : {};
      const response = await apiClient.get('/categories', { params });
      return response.data; // Array of categories (custom + predefined)
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch categories');
    }
  },

  getPredefinedCategories: async () => {
    try {
      const response = await apiClient.get('/categories/predefined');
      return response.data; // Array of predefined categories
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch predefined categories');
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch category');
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update category');
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data; // Success message
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete category');
    }
  },
};

export default categoryService;