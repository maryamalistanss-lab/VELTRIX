import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veltrix_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle expired/invalid JWT globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid — clear stored auth state and redirect to login
      const isAuthEndpoint = error?.config?.url?.includes('/auth/login') ||
                              error?.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('veltrix_token');
        localStorage.removeItem('veltrix_user');
        // Use native redirect to avoid React Router dependency issues in this module
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;