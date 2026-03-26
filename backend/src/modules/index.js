const userRoutes = require('./user/user.routes');
const evaluationRoutes = require('./evaluation/evaluation.routes');
const feedbackRoutes = require('./feedback/feedback.routes');
const meetingScheduleRoutes = require('./meeting-schedule/meeting-schedule.routes');
const notificationRoutes = require('./notification/notification.routes');
const questionRoutes = require('./question/question.routes');
const settingRoutes = require('./setting/setting.routes');
const reportRoutes = require('./report/report.routes');

module.exports = {
  userRoutes,
  evaluationRoutes,
  feedbackRoutes,
  meetingScheduleRoutes,
  notificationRoutes,
  questionRoutes,
  settingRoutes,
  reportRoutes,
};
