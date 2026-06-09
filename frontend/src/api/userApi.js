import apiClient from './apiClient';

const userApi = {
  getAll: (institutionId) => {
    const url = institutionId ? `/users?institution_id=${institutionId}` : '/users';
    return apiClient.get(url);
  },
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

export default userApi;
