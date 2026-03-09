const axios = require('axios');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API methods
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Evaluation API methods
export const evaluationAPI = {
  getAll: () => api.get('/evaluations'),
  getById: (id) => api.get(`/evaluations/${id}`),
  getByUserId: (userId) => api.get(`/evaluations/user/${userId}`),
  create: (evaluationData) => api.post('/evaluations', evaluationData),
  update: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData),
  delete: (id) => api.delete(`/evaluations/${id}`),
};

// Feedback API methods
export const feedbackAPI = {
  getAll: () => api.get('/feedbacks'),
  getById: (id) => api.get(`/feedbacks/${id}`),
  getByStudentId: (studentId) => api.get(`/feedbacks/student/${studentId}`),
  getByTeacherId: (teacherId) => api.get(`/feedbacks/teacher/${teacherId}`),
  create: (feedbackData) => api.post('/feedbacks', feedbackData),
  update: (id, feedbackData) => api.put(`/feedbacks/${id}`, feedbackData),
  delete: (id) => api.delete(`/feedbacks/${id}`),
};

// Meeting Schedule API methods
export const meetingAPI = {
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  getByStudentId: (studentId) => api.get(`/meetings/student/${studentId}`),
  create: (meetingData) => api.post('/meetings', meetingData),
  update: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
  delete: (id) => api.delete(`/meetings/${id}`),
};

// Notification API methods
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByUserId: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadByUserId: (userId) => api.get(`/notifications/user/${userId}/unread`),
  create: (notificationData) => api.post('/notifications', notificationData),
  update: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Question API methods
export const questionAPI = {
  getAll: () => api.get('/questions'),
  getById: (id) => api.get(`/questions/${id}`),
  create: (questionData) => api.post('/questions', questionData),
  update: (id, questionData) => api.put(`/questions/${id}`, questionData),
  delete: (id) => api.delete(`/questions/${id}`),
};

// Settings API methods
export const settingAPI = {
  getAll: () => api.get('/settings'),
  getById: (id) => api.get(`/settings/${id}`),
  getByKey: (key) => api.get(`/settings/key/${key}`),
  create: (settingData) => api.post('/settings', settingData),
  update: (id, settingData) => api.put(`/settings/${id}`, settingData),
  updateByKey: (key, value) => api.put(`/settings/key/${key}`, { value }),
  delete: (id) => api.delete(`/settings/${id}`),
  deleteByKey: (key) => api.delete(`/settings/key/${key}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health', { baseURL: process.env.API_BASE_URL || 'http://localhost:3000' }),
};

export default api;
