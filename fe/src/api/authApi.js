import api from './axiosConfig';

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const seedUsers = () =>
  api.post('/auth/seed-users');
