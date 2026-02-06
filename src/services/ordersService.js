import api from './api';

export const fetchOrders = (params = {}) => api.get('/orders', { params }).then(r => r.data);
export const fetchOrderById = (id) => api.get(`/orders/${id}`).then(r => r.data);
export const fetchOrdersByClient = (clientId, params = {}) => api.get(`/orders/client/${clientId}`, { params }).then(r => r.data);
export const fetchOrdersByStatus = (status, params = {}) => api.get(`/orders/status/${status}`, { params }).then(r => r.data);
export const createOrder = (payload) => api.post('/orders', payload).then(r => r.data);
export const confirmOrder = (id) => api.patch(`/orders/${id}/confirm`).then(r => r.data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`).then(r => r.data);
