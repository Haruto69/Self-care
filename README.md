# Self-care

Self-care is a beginner-friendly MERN web app that helps users choose personal improvement goals, answer setup questions, and receive daily rules-based tasks for body, skincare, and focus.

## Current V1 Features

- User signup, login, and protected routes.
- Goal selection for:
  - Exercise / Bodybuilding
  - Acne Reduction / Skincare
  - Focus / Studying
- Template-driven setup forms for each goal.
- Rules-based daily task generation from user inputs.
- Dashboard with today's tasks grouped by goal.
- Points Card with total points, points earned today, current level, and next-level progress.
- Task completion checkboxes, completion percentage, and point rewards.
- Point transaction history for auditability and future rewards.
- Levels calculated from lifetime points so future reward spending does not reduce progression.
- Progress page with simple goal summaries.
- Profile/settings page with logout and data reset.
- Backend validation for goal options, dates, and ObjectIds.
- Automated backend and frontend tests.

## Tech Stack

- MongoDB with Mongoose
- Express.js and Node.js
- React with Vite
- React Router
- Axios
- JWT authentication
- bcrypt password hashing
- Plain CSS
- Vitest, Supertest, MongoDB Memory Server, and Testing Library for tests

## Project Structure

```txt
server/
  app.js
  server.js
  config/
  controllers/
  goalRules/
  middleware/
  models/
  routes/
  services/
  tests/
  utils/

client/
  src/
    components/
    data/
    hooks/
    pages/
    services/
    styles/
    test/
    utils/
```

## Environment Variables

Backend `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/self-care
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
```

Frontend `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Example files are included at `server/.env.example` and `client/.env.example`.

For production setup on Vercel, Render, and MongoDB Atlas, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Local Setup

1. Install backend dependencies.

```bash
cd server
npm install
```

2. Create the backend environment file.

```bash
cp .env.example .env
```

Update `server/.env` if your MongoDB URL or frontend URL is different.

3. Start MongoDB locally.

Use your local MongoDB service, Docker, or MongoDB Compass connection. The default URL is:

```txt
mongodb://127.0.0.1:27017/self-care
```

4. Start the backend.

```bash
npm run dev
```

5. Install frontend dependencies in a second terminal.

```bash
cd client
npm install
```

6. Create the frontend environment file.

```bash
cp .env.example .env
```

7. Start the frontend.

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Test Commands

Backend tests:

```bash
cd server
npm test
```

Frontend tests:

```bash
cd client
npm test
```

Frontend production build:

```bash
cd client
npm run build
```

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Goals:

- `GET /api/goals`
- `POST /api/goals`
- `GET /api/goals/:id`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`

Tasks:

- `GET /api/tasks/today`
- `POST /api/tasks/generate`
- `PUT /api/tasks/:id/toggle`
- `GET /api/tasks/history`

Points:

- `GET /api/points/summary` - includes totals, today points, current level, next level, points needed, and progress percent
- `GET /api/points/history`

Check-ins:

- `POST /api/checkins`
- `GET /api/checkins`
- `GET /api/checkins/summary`

## Notes

- The task generator is rules-based. No AI features are included in V1.
- Check-in API routes exist, but there is no check-in UI yet.
- Deleting a goal also deletes its related tasks and check-ins.
- The profile page reset action deletes all goals for the current user, which also clears generated task history and check-ins.
- JWT is stored in `localStorage` for V1. Move auth to httpOnly cookies before production hardening.