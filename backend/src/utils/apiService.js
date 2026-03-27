const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => config, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => Promise.reject(error));

const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

const evaluationAPI = {
  getAll: () => api.get('/evaluations'),
  getById: (id) => api.get(`/evaluations/${id}`),
  getByUserId: (userId) => api.get(`/evaluations/user/${userId}`),
  create: (evaluationData) => api.post('/evaluations', evaluationData),
  update: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData),
  delete: (id) => api.delete(`/evaluations/${id}`),
};

const feedbackAPI = {
  getAll: () => api.get('/feedbacks'),
  getById: (id) => api.get(`/feedbacks/${id}`),
  getByStudentId: (studentId) => api.get(`/feedbacks/student/${studentId}`),
  getByTeacherId: (teacherId) => api.get(`/feedbacks/teacher/${teacherId}`),
  create: (feedbackData) => api.post('/feedbacks', feedbackData),
  update: (id, feedbackData) => api.put(`/feedbacks/${id}`, feedbackData),
  delete: (id) => api.delete(`/feedbacks/${id}`),
};

const meetingAPI = {
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  getByStudentId: (studentId) => api.get(`/meetings/student/${studentId}`),
  create: (meetingData) => api.post('/meetings', meetingData),
  update: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
  delete: (id) => api.delete(`/meetings/${id}`),
};

const notificationAPI = {
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

const questionAPI = {
  getAll: () => api.get('/questions'),
  getById: (id) => api.get(`/questions/${id}`),
  create: (questionData) => api.post('/questions', questionData),
  update: (id, questionData) => api.put(`/questions/${id}`, questionData),
  delete: (id) => api.delete(`/questions/${id}`),
};

const settingAPI = {
  getAll: () => api.get('/settings'),
  getById: (id) => api.get(`/settings/${id}`),
  getByKey: (key) => api.get(`/settings/key/${key}`),
  create: (settingData) => api.post('/settings', settingData),
  update: (id, settingData) => api.put(`/settings/${id}`, settingData),
  updateByKey: (key, value) => api.put(`/settings/key/${key}`, { value }),
  delete: (id) => api.delete(`/settings/${id}`),
  deleteByKey: (key) => api.delete(`/settings/key/${key}`),
};

const healthAPI = {
  check: () => api.get('/health', { baseURL: API_ORIGIN }),
};

module.exports = {
  api,
  API_BASE_URL,
  API_ORIGIN,
  userAPI,
  evaluationAPI,
  feedbackAPI,
  meetingAPI,
  notificationAPI,
  questionAPI,
  settingAPI,
  healthAPI,
};
