import api from './axiosConfig';

export const getChefs = () => api.get('/chefs');

export const getChefById = (id) => api.get(`/chefs/${id}`);
