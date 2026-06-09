import apiClient from './apiClient';

const roleApi = {
  getAll: () => apiClient.get('/roles'),
  getPermissions: (roleId) => apiClient.get(`/role-permissions/${roleId}`),
  create: (data) => apiClient.post('/roles', data),
  updatePermissions: (roleId, data) => apiClient.put(`/role-permissions/${roleId}`, data),
};

export default roleApi;
