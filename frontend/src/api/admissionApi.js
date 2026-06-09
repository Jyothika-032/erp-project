import apiClient from './apiClient';

const admissionApi = {
  getAll: (institutionId = 1) => apiClient.get('/admissions', { params: { institution_id: institutionId } }),
  create: (data) => apiClient.post('/admissions', data),
};

export default admissionApi;
