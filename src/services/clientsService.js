import api from './api';

export const fetchClients = (params = {}) => api.get('/clients', { params }).then(r => r.data);
export const fetchClientById = (id) => api.get(`/clients/${id}`).then(r => r.data);
export const createClient = (payload) => api.post('/clients', payload).then(r => r.data);
export const updateClient = (id, payload) => api.put(`/clients/${id}`, payload).then(r => r.data);
export const deleteClient = (id) => api.delete(`/clients/${id}`).then(r => r.data);
