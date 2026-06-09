import apiClient from './apiClient';

const institutionApi = {
  getAll: () => apiClient.get('/institutions'),
  getById: (id) => apiClient.get(`/institutions/${id}`),
  create: (data) => apiClient.post('/institutions', data),
  update: (id, data) => apiClient.put(`/institutions/${id}`, data),
  delete: (id) => apiClient.delete(`/institutions/${id}`),
};

export default institutionApi;
