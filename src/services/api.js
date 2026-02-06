import axios from 'axios';

/**
 * Axios instance configured for SmartShop API
 * - Uses proxy to backend via Vite dev server
 * - Includes credentials for session-based auth
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we've already warned about 401 to avoid console spam
let hasWarned401 = false;

/**
 * Response interceptor for centralized error handling
 */
api.interceptors.response.use(
  (response) => {
    hasWarned401 = false;
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle validation errors (422)
      if (status === 422 && data && data.errors) {
        error.validation = data.errors;
      }

      // Handle unauthorized errors (401)
      if (status === 401) {
        if (!hasWarned401) {
          console.warn('⚠️ API: 401 Unauthorized - You need to login first');
          console.warn('Go to /login and authenticate');
          hasWarned401 = true;
        }
        // Clear stored user marker to avoid re-hydration attempts
        try {
          localStorage.removeItem('user');
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
