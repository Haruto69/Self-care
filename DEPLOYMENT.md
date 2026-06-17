# Deployment Guide

This app is ready for a simple V1 deployment with:

- Frontend: Vercel
- Backend: Render Web Service
- Database: MongoDB Atlas

Deploy in this order:

1. Create the MongoDB Atlas database.
2. Deploy the Render backend.
3. Deploy the Vercel frontend.
4. Add the final Vercel URL to the backend CORS settings and redeploy the backend.

## Environment Variables

Never commit real `.env` files. Use the `.env.example` files as templates only.

### Backend: Render

Set these variables on the Render backend service.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Runs Express in production mode and hides stack traces in error responses. |
| `PORT` | No on Render | `5000` | Local fallback port. Render provides its own `PORT` automatically. |
| `MONGO_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/self-care?retryWrites=true&w=majority` | MongoDB Atlas connection string. |
| `JWT_SECRET` | Yes | `a-long-random-secret-at-least-32-chars` | Secret used to sign login tokens. Keep this private. |
| `CLIENT_URL` | Yes | `https://your-vercel-app.vercel.app` | Single allowed frontend origin for CORS. |
| `CLIENT_URLS` | Optional | `https://your-vercel-app.vercel.app,https://your-custom-domain.com` | Comma-separated allowed frontend origins. Use this when you have more than one allowed origin. If set, it takes priority over `CLIENT_URL`. |

Backend example:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/self-care?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URLS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

### Frontend: Vercel

Set this variable on the Vercel frontend project.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | Yes | `https://your-render-service.onrender.com` | Public backend base URL used by the React app. Do not include `/api`; the app adds that path in the API service. This value is bundled into the frontend build, so do not put secrets in any `VITE_*` variable. |

Frontend example:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

## MongoDB Atlas

1. Create or open an Atlas project.
2. Create a cluster.
3. Create a database user with a strong password.
4. Add a Network Access entry that allows your backend to connect.
   - Prefer a restricted Render outbound IP when your Render plan supports it.
   - For a beginner V1 deployment, `0.0.0.0/0` can unblock setup, but use a strong database password and tighten this later.
5. Get the Node.js connection string from Atlas.
6. Replace `<username>`, `<password>`, and `<cluster-url>` in `MONGO_URI`.
7. Use a database name in the URI, for example `/self-care`.

## Render Backend

1. Push the project to GitHub.
2. In Render, create a new Web Service from the repository.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

4. Add the backend environment variables listed above.
5. Deploy the service.
6. After deploy, test:

```txt
https://your-render-service.onrender.com/api/health
```

You should see:

```json
{
  "message": "Self-care API is running"
}
```

## Vercel Frontend

1. In Vercel, import the same GitHub repository.
2. Use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. Add the frontend environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

4. Deploy the frontend.
5. Copy the Vercel production URL.
6. In Render, update `CLIENT_URL` or `CLIENT_URLS` with the Vercel URL.
7. Redeploy the backend so the new CORS setting is active.

The `client/vercel.json` file is included so refreshing protected React Router pages or opening deep links still serves `index.html`.

## Post-Deployment Checklist

- Open the backend health endpoint.
- Open the Vercel frontend.
- Sign up with a new account.
- Select at least one goal.
- Fill out setup questions.
- Generate today's tasks.
- Toggle a task.
- Refresh the dashboard page.
- Open `/dashboard`, `/progress`, and `/profile` directly in the browser.

## Troubleshooting

| Symptom | Likely Fix |
| --- | --- |
| Frontend still calls `localhost` | Set `VITE_API_URL` in Vercel and redeploy the frontend. |
| Browser shows a CORS error | Add the exact Vercel URL to `CLIENT_URLS` or `CLIENT_URL` in Render, then redeploy the backend. |
| Backend returns database errors | Check `MONGO_URI`, Atlas database user credentials, and Atlas Network Access. |
| Vercel page refresh returns 404 | Confirm `client/vercel.json` exists and was deployed from the `client` root directory. |
| Login/register fails after deploy | Confirm `JWT_SECRET` is set on Render and the backend redeployed. |

## References

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Vite Deployment](https://vercel.com/docs/frameworks/frontend/vite)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode)
- [Render Node Express Deployment](https://render.com/docs/deploy-node-express-app)
- [Render Environment Variables](https://render.com/docs/configure-environment-variables)
- [MongoDB Atlas Connection Strings](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
- [MongoDB Atlas IP Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
