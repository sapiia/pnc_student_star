# Student Star REST API

A structured Express.js project for the Student Star system with MySQL.

## Project setup

1. `npm install`
2. Create `.env` at project root with:
   - `DB_HOST=localhost`
   - `DB_USER=your_username`
   - `DB_PASSWORD=your_password`
   - `DB_NAME=student_star_db`
   - `PORT=3000`
   - `API_BASE_URL=http://localhost:3000/api`
3. Start server:
   - `npm run dev` (development)
   - `npm start` (production)

## Health check

- `GET /health`

## API endpoints

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Evaluations
- `GET /api/evaluations`
- `GET /api/evaluations/:id`
- `GET /api/evaluations/user/:userId`
- `POST /api/evaluations`
- `PUT /api/evaluations/:id`
- `DELETE /api/evaluations/:id`

### Feedbacks
- `GET /api/feedbacks`
- `GET /api/feedbacks/:id`
- `GET /api/feedbacks/student/:studentId`
- `GET /api/feedbacks/teacher/:teacherId`
- `POST /api/feedbacks`
- `PUT /api/feedbacks/:id`
- `DELETE /api/feedbacks/:id`

### Meeting Schedules
- `GET /api/meetings`
- `GET /api/meetings/:id`
- `GET /api/meetings/student/:studentId`
- `POST /api/meetings`
- `PUT /api/meetings/:id`
- `DELETE /api/meetings/:id`

### Notifications
- `GET /api/notifications`
- `GET /api/notifications/:id`
- `GET /api/notifications/user/:userId`
- `GET /api/notifications/user/:userId/unread`
- `POST /api/notifications`
- `PUT /api/notifications/:id`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/user/:userId/read-all`
- `DELETE /api/notifications/:id`

### Questions
- `GET /api/questions`
- `GET /api/questions/:id`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`

### Settings
- `GET /api/settings`
- `GET /api/settings/:id`
- `GET /api/settings/key/:key`
- `POST /api/settings`
- `PUT /api/settings/:id`
- `PUT /api/settings/key/:key`
- `DELETE /api/settings/:id`
- `DELETE /api/settings/key/:key`

## Database schema summary
- `users`
- `evaluations`
- `feedbacks`
- `meeting_schedule`
- `notifications`
- `question`
- `settings`

## Example usage (Axios)

```js
// frontend/src/lib/apiService.ts or backend/src/utils/apiService.js
import StudentStarAPI from './utils/apiService';
const api = new StudentStarAPI();

const users = await api.getUsers();
await api.createEvaluation({ user_id: 5, period: '2026-Q3', living_stars: 4, job_study_stars: 5 });
```

## Notes

- API base: `http://localhost:3000/api`.
- Routes are defined in `src/routes/*.js` and handlers in `src/controllers/*.js`.
- Ensure the DB is ready and migrations are applied from `migrations/`.

@2026 Student Star REST API
