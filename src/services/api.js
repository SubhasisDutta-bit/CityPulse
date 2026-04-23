import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - maybe token expired
        console.warn('Unauthorized - redirecting to login');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API methods
export const api = {
  // Auth
  auth: {
    getMe: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    deleteAccount: () => apiClient.delete('/auth/account'),
  },

  // Cities
  cities: {
    getData: (city, lat, lon) => apiClient.get(`/cities/data/${city}`, { params: { lat, lon } }),
    search: (query) => apiClient.get('/cities/search', { params: { q: query } }),
    save: (data) => apiClient.post('/cities/save', data),
    getSaved: () => apiClient.get('/cities/saved'),
    deleteSaved: (id) => apiClient.delete(`/cities/saved/${id}`),
  },

  // Preferences
  preferences: {
    get: () => apiClient.get('/preferences'),
    update: (settings) => apiClient.put('/preferences', { settingsJson: settings }),
  },

  // Stats
  stats: {
    get: () => apiClient.get('/stats'),
  },
};
