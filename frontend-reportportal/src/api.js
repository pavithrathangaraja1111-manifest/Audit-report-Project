import axios from 'axios';
const BASE = 'http://localhost:5000/api';
const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export const login = (username, password) => api.post('/login', { username, password });
export const getReports = () => api.get('/reports');
export const getReport = id => api.get(`/reports/${id}`);
export const generateReport = id => api.post(`/audits/${id}/generate-report`);
export default api;
