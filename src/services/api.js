/**
 * Axios instance — central API client
 * Attaches JWT, handles 401 globally, normalizes errors
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nlas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nlas_token');
      localStorage.removeItem('nlas_user');
      window.dispatchEvent(new CustomEvent('nlas:session-expired'));
    }
    // Normalize error
    const apiError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error. Please check your connection.',
    };
    return Promise.reject(apiError);
  }
);

export default api;
