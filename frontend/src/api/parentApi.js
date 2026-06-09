import apiClient from './apiClient';

const parentApi = {
  getAll: (params = {}) => apiClient.get('/parents', { params }),
  create: (data) => apiClient.post('/parents', data),
  getByStudentId: (studentId) => apiClient.get('/parents', { params: { student_id: studentId } }),
  update: (id, data) => apiClient.put(`/parents/${id}`, data),
};

export default parentApi;
