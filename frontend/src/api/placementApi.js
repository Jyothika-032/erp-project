import apiClient from './apiClient';

const getInstitutionId = () => {
  const inst = JSON.parse(localStorage.getItem('currentInstitution') || '{}');
  return inst?.id || 1;
};

const placementApi = {
  getAll: () =>
    apiClient.get('/placements', { params: { institution_id: getInstitutionId() } }),

  getById: (id) =>
    apiClient.get(`/placements/${id}`),

  create: (data) =>
    apiClient.post('/placements', { ...data, institution_id: getInstitutionId() }),

  update: (id, data) =>
    apiClient.put(`/placements/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/placements/${id}`),
};

export default placementApi;
