# Self-care

A beginner-friendly MERN self-care app that lets users choose improvement goals,
answer setup questions, and receive daily tasks for body, skincare, and focus.

## Tech Stack

- MongoDB with Mongoose
- Express.js and Node.js
- React with Vite
- JWT authentication
- bcrypt password hashing
- Plain CSS

## Project Structure

```txt
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js

client/
  src/
    components/
    pages/
    data/
    hooks/
    services/
    utils/
    styles/
```

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

3. Start the backend.

```bash
npm run dev
```

4. Install frontend dependencies in a second terminal.

```bash
cd client
npm install
```

5. Create the frontend environment file.

```bash
cp .env.example .env
```

6. Start the frontend.

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at
`http://localhost:5000`.

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

Check-ins:

- `POST /api/checkins`
- `GET /api/checkins`
- `GET /api/checkins/summary`

## Notes

- The task generator is rules-based. No AI features are included yet.
- Deleting a goal also deletes its related tasks and check-ins.
- The profile page reset action deletes all goals for the current user, which also
  clears generated task history and check-ins.
