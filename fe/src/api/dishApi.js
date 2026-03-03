import api from './axiosConfig';

export const getDishes = () => api.get('/dishes');

export const getDishById = (id) => api.get(`/dishes/${id}`);

export const createDish = (formData) =>
  api.post('/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateDish = (id, formData) =>
  api.put(`/dishes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDish = (id) => api.delete(`/dishes/${id}`);
