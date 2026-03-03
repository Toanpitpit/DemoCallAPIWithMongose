import api from './axiosConfig';

export const getIngredients = () => api.get('/ingredients');

export const getIngredientById = (id) => api.get(`/ingredients/${id}`);
