import apiClient from './apiClient';

const mergeLogApi = {
  getAll: () => apiClient.get('/merge-log'),
  create: (data) => apiClient.post('/merge-log', data),
};

export default mergeLogApi;
