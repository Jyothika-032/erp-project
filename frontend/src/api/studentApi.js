import apiClient from "./apiClient";

export const studentApi = {
  getStudents: (institutionId = 1) => 
    apiClient.get("/students", { params: { institution_id: institutionId } }),

  getStudentById: (id) => 
    apiClient.get(`/students/${id}`),

  createStudent: (data) => 
    apiClient.post("/students", data),

  updateStudent: (id, data) => 
    apiClient.put(`/students/${id}`, data),

  deleteStudent: (id) => 
    apiClient.delete(`/students/${id}`),
};

export default studentApi;
