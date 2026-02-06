import api from './api';

// Fetch payments for a specific order
export const fetchPaymentsByOrder = (orderId) => api.get(`/payments/order/${orderId}`).then(r => r.data);

// Create a new payment
export const createPayment = (payload) => api.post('/payments', payload).then(r => r.data);

// Get payment by ID
export const fetchPaymentById = (id) => api.get(`/payments/${id}`).then(r => r.data);
