import api from './axiosConfig';

export const getIngredients = () => api.get('/ingredients');

export const getIngredientById = (id) => api.get(`/ingredients/${id}`);

export const createIngredient = (data) => api.post('/ingredients', data);

export const updateIngredient = (id, data) => api.put(`/ingredients/${id}`, data);

export const deleteIngredient = (id) => api.delete(`/ingredients/${id}`);
