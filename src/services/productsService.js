import api from './api';

/**
 * Fetch all products
 * @returns {Promise<Array>} List of products
 */
export const fetchProducts = () => api.get('/products').then(r => r.data);

/**
 * Fetch a single product by ID
 * @param {number} id - Product ID
 * @returns {Promise<Object>} Product details
 */
export const fetchProductById = (id) => api.get(`/products/${id}`).then(r => r.data);

/**
 * Create a new product
 * @param {Object} payload - Product data (nom, prixUnitaire, stock)
 * @returns {Promise<Object>} Created product
 */
export const createProduct = (payload) => api.post('/products', payload).then(r => r.data);

/**
 * Update an existing product
 * @param {number} id - Product ID
 * @param {Object} payload - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then(r => r.data);

/**
 * Delete a product (soft delete)
 * @param {number} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);
