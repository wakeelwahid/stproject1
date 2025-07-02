// utils/adminAxios.js
import axios from 'axios';

const adminAxios = axios.create({
  baseURL: 'https://stproject1.onrender.com/api/',
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminAxios;
