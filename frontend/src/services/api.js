import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const songAPI = {
  createSong: (data) => api.post('/songs', data),
  createAnonymousSong: (data) => api.post('/songs/anonymous', data),
  getSongs: () => api.get('/songs'),
  getSong: (id) => api.get(`/songs/${id}`),
  updateSong: (id, data) => api.put(`/songs/${id}`, data),
  deleteSong: (id) => api.delete(`/songs/${id}`),
};

export const paymentAPI = {
  createCheckoutSession: (data) => api.post('/payment/create-checkout-session', data),
  cancelSubscription: () => api.post('/payment/cancel-subscription'),
  getConfig: () => api.get('/payment/config'),
};

export default api;
