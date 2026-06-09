import apiClient from './apiClient';

const commsApi = {
  getLogs: (institutionId) => apiClient.get('/comms-logs', { params: { institution_id: institutionId } }),
  createLog: (data) => apiClient.post('/comms-logs', data),
  getById: (id) => apiClient.get(`/comms-logs/${id}`),
  sendAlert: (payload) => apiClient.post('/comms-logs/send', payload),
};

export default commsApi;
