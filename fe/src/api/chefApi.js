import api from './axiosConfig';

export const getChefs = () => api.get('/chefs');

export const getChefById = (id) => api.get(`/chefs/${id}`);

export const createChef = (data) => api.post('/chefs', data);

export const updateChef = (id, data) => api.put(`/chefs/${id}`, data);

export const deleteChef = (id) => api.delete(`/chefs/${id}`);
