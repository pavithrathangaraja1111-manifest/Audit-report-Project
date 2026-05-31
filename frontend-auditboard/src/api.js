import axios from 'axios';

const BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const login = (username, password) =>
  api.post('/login', { username, password });

export const getAudits = () => api.get('/audits');
export const getAudit = id => api.get(`/audits/${id}`);
export const createAudit = data => api.post('/audits', data);
export const updateAudit = (id, data) => api.put(`/audits/${id}`, data);
export const deleteAudit = id => api.delete(`/audits/${id}`);
export const generateReport = id => api.post(`/audits/${id}/generate-report`);

export default api;
