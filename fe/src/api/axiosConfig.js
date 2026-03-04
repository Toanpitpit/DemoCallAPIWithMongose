import axios from 'axios';

const API_BASE_URL = 'http://localhost:9999/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const BASE_URL = 'http://localhost:9999';

/** Build full image URL. Supports both "assets/..." and "/assets/..." paths. */
export const getImageUrl = (path) => {
  if (!path) return null;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
};

export default api;
