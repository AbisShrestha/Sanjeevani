import api from './api';

/**
 * Fetch all active medicine categories
 * Public endpoint
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};
