import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getIncidents = (params) => API.get('/incidents', { params });
export const getStats = () => API.get('/stats');
export const getIncident = (id) => API.get(`/incidents/${id}`);
export const updateStatus = (id, status) => API.patch(`/incidents/${id}/status`, { status });
export const submitReport = (formData) => API.post('/report', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
