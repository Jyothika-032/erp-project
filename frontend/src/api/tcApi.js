import api from './apiClient';

const INST_ID = 1; // TODO: get from auth context

export const getTransferCertificates = (params = {}) =>
    api.get('/tc', { params: { institution_id: INST_ID, ...params } });

export const createTransferCertificate = (data) =>
    api.post('/tc', { ...data, institution_id: INST_ID });

export const updateTcStatus = (id, status) =>
    api.put(`/tc/${id}`, { status });

export const updateTc = (id, data) =>
    api.put(`/tc/${id}`, data);

export const deleteTc = (id) =>
    api.delete(`/tc/${id}`);
