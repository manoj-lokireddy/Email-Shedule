# Deployment

This repository contains a Vite React frontend and a Node.js/Express TypeScript backend. The backend also has a separate BullMQ email worker.

## 1. Local Docker test

Run these commands in the VS Code terminal from the repository root:

```powershell
docker compose up -d
docker compose ps
Invoke-WebRequest http://localhost:5174/health -UseBasicParsing
docker compose logs --tail=100 backend worker
```

Open `http://localhost:8080` for the Dockerized frontend. The Dockerized API is `http://localhost:5174`.

Stop the stack:

```powershell
docker compose down
```

Remove containers and local database/Redis/Elasticsearch volumes:

```powershell
docker compose down -v
```

Rebuild after code changes:

```powershell
docker compose build --no-cache
docker compose up -d
```

## 2. Push to GitHub

Do not commit either `.env` file. They are ignored by Git. Before pushing, check:

```powershell
git status --short
git ls-files backend/.env frontend/.env
```

The second command must print nothing. Then push the repository:

```powershell
git add .
git commit -m "Add production Docker deployment"
git push origin main
```

If the repository has no remote yet, create an empty GitHub repository first, then run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

## 3. Railway backend API

Create a Railway project from the GitHub repository.

Add these Railway services first:

- PostgreSQL
- Redis
- Backend API service
- Backend worker service

For the backend API service:

- Source: the GitHub repository
- Root directory: `/backend`
- Builder: Dockerfile
- Dockerfile: `backend/Dockerfile` (it is the Dockerfile in the selected root directory)
- Start command: leave the Dockerfile command, or use `sh -c 'npx prisma migrate deploy && node dist/server.js'`
- Public networking: generate a domain
- Port: Railway supplies `PORT`; the server already listens on `0.0.0.0` and uses that variable

Add these variables to the API service. Use Railway's reference picker for `DATABASE_URL` and `REDIS_URL`:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ELASTICSEARCH_URL=https://YOUR_ELASTIC_CLOUD_ENDPOINT
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://YOUR_BACKEND_DOMAIN/api/auth/google/callback
SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
SLACK_REDIRECT_URI=https://YOUR_BACKEND_DOMAIN/api/slack/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USER
SMTP_PASSWORD=YOUR_NEW_SMTP_APP_PASSWORD
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
FRONTEND_URL=https://YOUR_VERCEL_DOMAIN
WORKER_CONCURRENCY=5
MAX_EMAILS_PER_HOUR_PER_SENDER=100
```

Railway may expose the Postgres and Redis reference variable names slightly differently in its UI. Select the generated `DATABASE_URL` and `REDIS_URL` values from the service reference menu instead of typing private hostnames manually.

`ELASTICSEARCH_URL` is required for email search. Use an external Elasticsearch provider such as Elastic Cloud. The mail worker catches search-indexing errors, but search will not work without this service.

Deploy the API and verify:

```text
https://YOUR_BACKEND_DOMAIN/health
```

Expected response:

```json
{"ok":true}
```

For the worker service:

- Use the same GitHub repository
- Root directory: `/backend`
- Builder: Dockerfile
- Dockerfile: `backend/Dockerfile`
- Start command: `node dist/workers/email.worker.js`
- Add the same database, Redis, SMTP, Elasticsearch, and JWT variables as the API service
- Do not generate a public domain for the worker

The worker log must contain `Email worker ready`.

## 4. Vercel frontend

Create a Vercel project from the same GitHub repository.

- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Add this Vercel environment variable for Production, Preview, and Development:

```env
VITE_API_URL=https://YOUR_BACKEND_DOMAIN/api
```

Deploy and copy the resulting Vercel URL. Set that exact URL as the Railway API service's `FRONTEND_URL`, then redeploy the API.

## 5. OAuth settings

In Google Cloud Console, edit the OAuth client used by the deployed API and add:

- Authorized JavaScript origin: `https://YOUR_VERCEL_DOMAIN`
- Authorized redirect URI: `https://YOUR_BACKEND_DOMAIN/api/auth/google/callback`

Add the same production callback URL to Slack if Slack OAuth is enabled. Add test users in Google OAuth consent settings while the app is in testing mode.

## 6. Production checklist

- Frontend opens at the Vercel URL.
- `https://YOUR_BACKEND_DOMAIN/health` returns `{"ok":true}`.
- Browser requests use `https://YOUR_BACKEND_DOMAIN/api`, not localhost.
- Railway API logs show migrations applied and the correct `FRONTEND_URL`.
- Railway worker logs show `Email worker ready`.
- Railway Postgres and Redis references are connected.
- Google and Slack callbacks use HTTPS production URLs.
- SMTP uses a newly generated app password.
- `git ls-files backend/.env frontend/.env` prints nothing.
- No secret values are present in GitHub.
- No production browser build contains localhost URLs.

## Troubleshooting

View Railway logs from the service's **Deployments** tab. Locally, use:

```powershell
docker compose logs -f backend worker
```

Common errors:

- `redirect_uri_mismatch`: the callback URL in Google Cloud does not exactly match `GOOGLE_CALLBACK_URL`.
- `P1001` or database connection errors: `DATABASE_URL` is missing or points to localhost; use the Railway Postgres reference.
- Emails remain scheduled: the worker is not deployed or `REDIS_URL` differs between API and worker.
- CORS errors: `FRONTEND_URL` must exactly equal the Vercel origin, without a trailing slash.
- `PORT` errors: do not hardcode a production port; Railway supplies `PORT`, and the server already binds to `0.0.0.0`.
