import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veltrix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired and not on public pages
      const publicPaths = ['/login', '/register', '/forgot-password', '/', '/pricing'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('veltrix_token');
        localStorage.removeItem('veltrix_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
