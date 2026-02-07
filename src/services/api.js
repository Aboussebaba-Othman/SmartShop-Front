import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let hasWarned401 = false;

api.interceptors.response.use(
  (response) => {
    hasWarned401 = false;
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 422 && data && data.errors) {
        error.validation = data.errors;
      }

      if (status === 401) {
        if (!hasWarned401) {
          console.warn('⚠️ API: 401 Unauthorized - Redirecting to login');
          hasWarned401 = true;
        }
        try {
          localStorage.removeItem('user');
        } catch (e) { }

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
