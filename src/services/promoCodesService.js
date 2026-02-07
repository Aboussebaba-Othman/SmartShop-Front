import api from './api';

export const fetchPromoCodes = () => api.get('/promo-codes').then(r => r.data);
export const fetchPromoCodeByCode = (code) => api.get(`/promo-codes/${code}`).then(r => r.data);
export const createPromoCode = (payload) => api.post('/promo-codes', payload).then(r => r.data);
export const deactivatePromoCode = (id) => api.patch(`/promo-codes/${id}/deactivate`).then(r => r.data);
