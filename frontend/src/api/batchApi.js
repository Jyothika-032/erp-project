import apiClient from "./apiClient";

export const batchApi = {
  getBatches: () => 
    apiClient.get("/batches"),

  createBatch: (data) => 
    apiClient.post("/batches", data),

  updateBatch: (id, data) => 
    apiClient.put(`/batches/${id}`, data),

  deleteBatch: (id) => 
    apiClient.delete(`/batches/${id}`),
};

export default batchApi;
