# My Node Project

A structured Node.js Express application following MVC pattern with MySQL database for Student Star Database system.

## Project Structure

```
my-node-project/
├── src/                     # Source code
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
├── config/                 # Configuration files
│   └── database.js         # Database connection
├── controllers/            # Route controllers
│   ├── userController.js   # User-related logic
│   ├── evaluationController.js # Evaluation logic
│   ├── feedbackController.js    # Feedback logic
│   ├── meetingScheduleController.js # Meeting logic
│   ├── notificationController.js # Notification logic
│   ├── questionController.js    # Question logic
│   └── settingController.js     # Setting logic
├── models/                 # Data models
│   ├── User.js             # User model
│   ├── Evaluation.js       # Evaluation model
│   ├── Feedback.js         # Feedback model
│   ├── MeetingSchedule.js  # Meeting model
│   ├── Notification.js     # Notification model
│   ├── Question.js         # Question model
│   └── Setting.js          # Setting model
├── routes/                 # API routes
│   ├── userRoutes.js       # User routes
│   ├── evaluationRoutes.js  # Evaluation routes
│   ├── feedbackRoutes.js   # Feedback routes
│   ├── meetingScheduleRoutes.js # Meeting routes
│   ├── notificationRoutes.js # Notification routes
│   ├── questionRoutes.js   # Question routes
│   └── settingRoutes.js    # Setting routes
├── middleware/             # Custom middleware
├── utils/                  # Utility functions
│   └── apiService.js       # Axios API service
├── examples/               # Example implementations
│   ├── frontend-example.html # Browser demo
│   └── node-example.js     # Node.js demo
├── tests/                  # Test files
├── docs/                   # Documentation
├── .env                    # Environment variables
├── package.json            # Project dependencies
└── README.md               # This file
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=student_star_db
PORT=3000
API_BASE_URL=http://localhost:3000/api
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (currently not configured)

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Evaluations
- `GET /api/evaluations` - Get all evaluations
- `GET /api/evaluations/:id` - Get evaluation by ID
- `GET /api/evaluations/user/:userId` - Get evaluations by user ID
- `POST /api/evaluations` - Create new evaluation
- `PUT /api/evaluations/:id` - Update evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

### Feedbacks
- `GET /api/feedbacks` - Get all feedbacks
- `GET /api/feedbacks/:id` - Get feedback by ID
- `GET /api/feedbacks/student/:studentId` - Get feedbacks by student ID
- `GET /api/feedbacks/teacher/:teacherId` - Get feedbacks by teacher ID
- `POST /api/feedbacks` - Create new feedback
- `PUT /api/feedbacks/:id` - Update feedback
- `DELETE /api/feedbacks/:id` - Delete feedback

### Meeting Schedules
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/:id` - Get meeting by ID
- `GET /api/meetings/student/:studentId` - Get meetings by student ID
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/:id` - Get notification by ID
- `GET /api/notifications/user/:userId` - Get notifications by user ID
- `GET /api/notifications/user/:userId/unread` - Get unread notifications by user ID
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id` - Update notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all notifications as read for user
- `DELETE /api/notifications/:id` - Delete notification

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:id` - Get setting by ID
- `GET /api/settings/key/:key` - Get setting by key
- `POST /api/settings` - Create new setting
- `PUT /api/settings/:id` - Update setting
- `PUT /api/settings/key/:key` - Update setting by key
- `DELETE /api/settings/:id` - Delete setting
- `DELETE /api/settings/key/:key` - Delete setting by key

## Database Schema

The application uses the following tables:

- **users** - User accounts (students, teachers, admins)
- **evaluations** - Student evaluations with star ratings
- **feedbacks** - Teacher feedback for students
- **meeting_schedule** - Meeting schedules between students, education officers, and managers
- **notifications** - System notifications for users
- **question** - Evaluation questions
- **settings** - Application settings

## API Usage Examples

### Using Axios (Node.js)

```javascript
const StudentStarAPI = require('./utils/apiService');

const api = new StudentStarAPI();

// Get all users
const users = await api.getUsers();

// Create new evaluation
const evaluation = await api.createEvaluation({
  user_id: 5,
  period: '2026-Q3',
  living_stars: 4,
  job_study_stars: 5,
  // ... other star ratings
});
```

### Using Browser (JavaScript)

```javascript
// Using the provided frontend example
// Open examples/frontend-example.html in your browser
// Make sure the server is running on localhost:3000

// Direct API calls with axios
const response = await axios.get('http://localhost:3000/api/users');
const users = response.data;
```

## Features

- Express.js framework with MVC architecture
- MySQL database with connection pooling
- Password hashing with bcrypt
- RESTful API design
- Complete CRUD operations for all tables
- Axios integration for frontend consumption
- Environment variable configuration
- Comprehensive error handling
- Relationship-based queries with JOIN operations

## Development

The project follows the MVC (Model-View-Controller) pattern:

- **Models**: Handle database operations and data logic with proper relationships
- **Controllers**: Handle request/response logic and business rules
- **Routes**: Define API endpoints and map to controllers
- **Config**: Database and application configuration

## Examples

- **Frontend Demo**: `examples/frontend-example.html` - Interactive browser demo
- **Node.js Demo**: `examples/node-example.js` - Complete Node.js API client
- **API Service**: `utils/apiService.js` - Reusable axios service for frontend integration

## Testing the API

1. Start the server: `npm start`
2. Open `examples/frontend-example.html` in your browser
3. Or run the Node.js example: `node examples/node-example.js`

## Database Setup

Import the provided SQL file to set up your database:

```bash
mysql -u username -p database_name < student_star_db.sql
```

Make sure to update your `.env` file with the correct database credentials.
