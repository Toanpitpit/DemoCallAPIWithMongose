import api from './axiosConfig';

export const getCategories = () => api.get('/categories');

export const getCategoryById = (id) => api.get(`/categories/${id}`);
