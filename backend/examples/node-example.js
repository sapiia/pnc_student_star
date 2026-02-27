const axios = require('axios');

// Configure axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service class
class StudentStarAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      return error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
      return { error: 'Network error', message: error.message };
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return { error: 'Request error', message: error.message };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get('http://localhost:3000/health');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Users API
  async getUsers() {
    try {
      const response = await this.client.get('/users');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const response = await this.client.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await this.client.post('/users', userData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.client.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      const response = await this.client.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Evaluations API
  async getEvaluations() {
    try {
      const response = await this.client.get('/evaluations');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getEvaluationById(id) {
    try {
      const response = await this.client.get(`/evaluations/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getEvaluationsByUserId(userId) {
    try {
      const response = await this.client.get(`/evaluations/user/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createEvaluation(evaluationData) {
    try {
      const response = await this.client.post('/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateEvaluation(id, evaluationData) {
    try {
      const response = await this.client.put(`/evaluations/${id}`, evaluationData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteEvaluation(id) {
    try {
      const response = await this.client.delete(`/evaluations/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Feedbacks API
  async getFeedbacks() {
    try {
      const response = await this.client.get('/feedbacks');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFeedbackById(id) {
    try {
      const response = await this.client.get(`/feedbacks/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFeedbacksByStudentId(studentId) {
    try {
      const response = await this.client.get(`/feedbacks/student/${studentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFeedbacksByTeacherId(teacherId) {
    try {
      const response = await this.client.get(`/feedbacks/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createFeedback(feedbackData) {
    try {
      const response = await this.client.post('/feedbacks', feedbackData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateFeedback(id, feedbackData) {
    try {
      const response = await this.client.put(`/feedbacks/${id}`, feedbackData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteFeedback(id) {
    try {
      const response = await this.client.delete(`/feedbacks/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Meeting Schedule API
  async getMeetings() {
    try {
      const response = await this.client.get('/meetings');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMeetingById(id) {
    try {
      const response = await this.client.get(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMeetingsByStudentId(studentId) {
    try {
      const response = await this.client.get(`/meetings/student/${studentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createMeeting(meetingData) {
    try {
      const response = await this.client.post('/meetings', meetingData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateMeeting(id, meetingData) {
    try {
      const response = await this.client.put(`/meetings/${id}`, meetingData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteMeeting(id) {
    try {
      const response = await this.client.delete(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Notifications API
  async getNotifications() {
    try {
      const response = await this.client.get('/notifications');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getNotificationById(id) {
    try {
      const response = await this.client.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getNotificationsByUserId(userId) {
    try {
      const response = await this.client.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUnreadNotificationsByUserId(userId) {
    try {
      const response = await this.client.get(`/notifications/user/${userId}/unread`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createNotification(notificationData) {
    try {
      const response = await this.client.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markNotificationAsRead(id) {
    try {
      const response = await this.client.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      const response = await this.client.put(`/notifications/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteNotification(id) {
    try {
      const response = await this.client.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Questions API
  async getQuestions() {
    try {
      const response = await this.client.get('/questions');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getQuestionById(id) {
    try {
      const response = await this.client.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createQuestion(questionData) {
    try {
      const response = await this.client.post('/questions', questionData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateQuestion(id, questionData) {
    try {
      const response = await this.client.put(`/questions/${id}`, questionData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteQuestion(id) {
    try {
      const response = await this.client.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Settings API
  async getSettings() {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSettingById(id) {
    try {
      const response = await this.client.get(`/settings/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSettingByKey(key) {
    try {
      const response = await this.client.get(`/settings/key/${key}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createSetting(settingData) {
    try {
      const response = await this.client.post('/settings', settingData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSetting(id, settingData) {
    try {
      const response = await this.client.put(`/settings/${id}`, settingData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSettingByKey(key, value) {
    try {
      const response = await this.client.put(`/settings/key/${key}`, { value });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteSetting(id) {
    try {
      const response = await this.client.delete(`/settings/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteSettingByKey(key) {
    try {
      const response = await this.client.delete(`/settings/key/${key}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Example usage
async function demonstrateAPI() {
  const api = new StudentStarAPI();

  console.log('=== Student Star Database API Demo ===\n');

  // Health check
  console.log('1. Health Check:');
  const health = await api.healthCheck();
  console.log(health);
  console.log();

  // Get all users
  console.log('2. Get All Users:');
  const users = await api.getUsers();
  console.log(`Found ${users.length} users`);
  if (users.length > 0) {
    console.log('First user:', users[0]);
  }
  console.log();

  // Create a new user
  console.log('3. Create New User:');
  const newUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student',
    class: 'Test-A'
  };
  const createResult = await api.createUser(newUser);
  console.log('Create result:', createResult);
  console.log();

  // Get all evaluations
  console.log('4. Get All Evaluations:');
  const evaluations = await api.getEvaluations();
  console.log(`Found ${evaluations.length} evaluations`);
  if (evaluations.length > 0) {
    console.log('First evaluation:', evaluations[0]);
  }
  console.log();

  // Create a new evaluation
  if (users.length > 0) {
    console.log('5. Create New Evaluation:');
    const newEvaluation = {
      user_id: users[0].id,
      period: '2026-Q3',
      living_stars: 4,
      job_study_stars: 5,
      human_support_stars: 4,
      health_stars: 5,
      feeling_stars: 4,
      choice_behavior_stars: 5,
      money_payment_stars: 4,
      life_skill_stars: 4
    };
    const evalResult = await api.createEvaluation(newEvaluation);
    console.log('Evaluation result:', evalResult);
    console.log();
  }

  // Get all feedbacks
  console.log('6. Get All Feedbacks:');
  const feedbacks = await api.getFeedbacks();
  console.log(`Found ${feedbacks.length} feedbacks`);
  if (feedbacks.length > 0) {
    console.log('First feedback:', feedbacks[0]);
  }
  console.log();

  console.log('=== Demo Complete ===');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateAPI().catch(console.error);
}

module.exports = StudentStarAPI;
