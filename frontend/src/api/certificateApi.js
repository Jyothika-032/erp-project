import api from './apiClient';

const INST_ID = 1; // TODO: get from auth context

export const getCertificates = (params = {}) =>
    api.get('/certificates', { params: { institution_id: INST_ID, ...params } });

export const getCertificateById = (id) =>
    api.get(`/certificates/${id}`);

export const createCertificate = (data) =>
    api.post('/certificates', { ...data, institution_id: INST_ID });

export const updateCertificate = (id, data) =>
    api.put(`/certificates/${id}`, data);

export const deleteCertificate = (id) =>
    api.delete(`/certificates/${id}`);
