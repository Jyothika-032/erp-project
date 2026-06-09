import api from './apiClient';

export const getPayments = (params = {}) =>
    api.get('/payments', { params });

export const getPaymentById = (id) =>
    api.get(`/payments/${id}`);

export const createPayment = (data) =>
    api.post('/payments', { ...data, institution_id: 1 });

export const updatePayment = (id, data) =>
    api.put(`/payments/${id}`, data);

export const deletePayment = (id) =>
    api.delete(`/payments/${id}`);
