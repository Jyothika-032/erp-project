import apiClient from './apiClient';

const attendanceApi = {
  getStudents: (batchId, date) => apiClient.get('/attendance/students', { params: { batch_id: batchId, date } }),
  getTeachers: (date) => apiClient.get('/attendance/teachers', { params: { date } }),
  markStudentAttendance: (data) => apiClient.post('/attendance/students', data),
  markTeacherAttendance: (data) => apiClient.post('/attendance/teachers', data),
  updateStudentAttendance: (id, data) => apiClient.put(`/attendance/students/${id}`, data),
  updateTeacherAttendance: (id, data) => apiClient.put(`/attendance/teachers/${id}`, data),
  getStudentsList: () => apiClient.get('/students'),
  getStaffList: () => apiClient.get('/staff'),
  getBatches: () => apiClient.get('/batches'),
  getCourses: () => apiClient.get('/courses'),
  getInstitutions: () => apiClient.get('/institutions'),
};

export default attendanceApi;
