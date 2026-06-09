import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Multi-tenancy & Auth Headers
apiClient.interceptors.request.use(
  (config) => {
    // 1. Add Auth Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Add Institution Context (Step 3 requirement)
    const currentInstitution = JSON.parse(localStorage.getItem('currentInstitution') || '{}');
    if (currentInstitution?.id) {
      config.headers['x-institution-id'] = currentInstitution.id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Consistent Error Format (Step 3/6)
apiClient.interceptors.response.use(
  (response) => {
    // Step 3: Consistent response format
    return response.data; 
  },
  (error) => {
    // Step 6: Consistent error handling
    const errorMessage = error.response?.data?.message || 'A network error occurred. Please try again.';
    
    if (error.response?.status === 401) {
      // Clear storage and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status
    });
  }
);

export const api = apiClient;
export default apiClient;
