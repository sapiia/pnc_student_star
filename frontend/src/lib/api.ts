const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Error');
  }

  return response.json();
};

export const userAPI = {
  getAll: () => fetchApi('/users'),
  getById: (id: number | string) => fetchApi(`/users/${id}`),
  create: (userData: any) => fetchApi('/users', { method: 'POST', body: JSON.stringify(userData) }),
  update: (id: number | string, userData: any) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  delete: (id: number | string) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
};

export const evaluationAPI = {
  getAll: () => fetchApi('/evaluations'),
  getById: (id: number | string) => fetchApi(`/evaluations/${id}`),
  getByUserId: (userId: number | string) => fetchApi(`/evaluations/user/${userId}`),
  create: (evaluationData: any) => fetchApi('/evaluations', { method: 'POST', body: JSON.stringify(evaluationData) }),
  update: (id: number | string, evaluationData: any) => fetchApi(`/evaluations/${id}`, { method: 'PUT', body: JSON.stringify(evaluationData) }),
  delete: (id: number | string) => fetchApi(`/evaluations/${id}`, { method: 'DELETE' }),
};

export const feedbackAPI = {
  getAll: () => fetchApi('/feedbacks'),
  getById: (id: number | string) => fetchApi(`/feedbacks/${id}`),
  getByStudentId: (studentId: number | string) => fetchApi(`/feedbacks/student/${studentId}`),
  getByTeacherId: (teacherId: number | string) => fetchApi(`/feedbacks/teacher/${teacherId}`),
  create: (feedbackData: any) => fetchApi('/feedbacks', { method: 'POST', body: JSON.stringify(feedbackData) }),
  update: (id: number | string, feedbackData: any) => fetchApi(`/feedbacks/${id}`, { method: 'PUT', body: JSON.stringify(feedbackData) }),
  delete: (id: number | string) => fetchApi(`/feedbacks/${id}`, { method: 'DELETE' }),
};

export const meetingAPI = {
  getAll: () => fetchApi('/meetings'),
  getById: (id: number | string) => fetchApi(`/meetings/${id}`),
  getByStudentId: (studentId: number | string) => fetchApi(`/meetings/student/${studentId}`),
  create: (meetingData: any) => fetchApi('/meetings', { method: 'POST', body: JSON.stringify(meetingData) }),
  update: (id: number | string, meetingData: any) => fetchApi(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(meetingData) }),
  delete: (id: number | string) => fetchApi(`/meetings/${id}`, { method: 'DELETE' }),
};

export const notificationAPI = {
  getAll: () => fetchApi('/notifications'),
  getById: (id: number | string) => fetchApi(`/notifications/${id}`),
  getByUserId: (userId: number | string) => fetchApi(`/notifications/user/${userId}`),
  getUnreadByUserId: (userId: number | string) => fetchApi(`/notifications/user/${userId}/unread`),
  create: (notificationData: any) => fetchApi('/notifications', { method: 'POST', body: JSON.stringify(notificationData) }),
  update: (id: number | string, notificationData: any) => fetchApi(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify(notificationData) }),
  markAsRead: (id: number | string) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: (userId: number | string) => fetchApi(`/notifications/user/${userId}/read-all`, { method: 'PUT' }),
  delete: (id: number | string) => fetchApi(`/notifications/${id}`, { method: 'DELETE' }),
};

export const questionAPI = {
  getAll: () => fetchApi('/questions'),
  getById: (id: number | string) => fetchApi(`/questions/${id}`),
  create: (questionData: any) => fetchApi('/questions', { method: 'POST', body: JSON.stringify(questionData) }),
  update: (id: number | string, questionData: any) => fetchApi(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) }),
  delete: (id: number | string) => fetchApi(`/questions/${id}`, { method: 'DELETE' }),
};

export const settingAPI = {
  getAll: () => fetchApi('/settings'),
  getById: (id: number | string) => fetchApi(`/settings/${id}`),
  getByKey: (key: string) => fetchApi(`/settings/key/${key}`),
  create: (settingData: any) => fetchApi('/settings', { method: 'POST', body: JSON.stringify(settingData) }),
  update: (id: number | string, settingData: any) => fetchApi(`/settings/${id}`, { method: 'PUT', body: JSON.stringify(settingData) }),
  updateByKey: (key: string, value: any) => fetchApi(`/settings/key/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  delete: (id: number | string) => fetchApi(`/settings/${id}`, { method: 'DELETE' }),
  deleteByKey: (key: string) => fetchApi(`/settings/key/${key}`, { method: 'DELETE' }),
};
