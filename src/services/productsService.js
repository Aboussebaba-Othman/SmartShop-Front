import api from './api';

export const fetchProducts = () => api.get('/products').then(r => r.data);
export const fetchProductById = (id) => api.get(`/products/${id}`).then(r => r.data);
export const createProduct = (payload) => api.post('/products', payload).then(r => r.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);
