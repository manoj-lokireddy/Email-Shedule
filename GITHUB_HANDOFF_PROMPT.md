# GitHub Handoff Prompt

Use this prompt when publishing or sharing the project:

```text
Publish this Email Scheduler project as a private GitHub repository.

Repository name: email-scheduler
Description: Production-style full-stack email scheduler using React, Express, PostgreSQL, Redis, BullMQ, SMTP, Elasticsearch, and Bull Board.

Include:
- backend/
- frontend/
- prisma schema and migrations
- docker-compose.yml
- sample-leads.csv
- README.md
- docs/screenshots/login.png
- docs/showcase.html
- docs/email-scheduler-showcase.pdf
- .env.example files

Do not include:
- backend/.env
- frontend/.env
- node_modules/
- dist/
- Gmail App Passwords
- Google OAuth Client Secret
- Slack tokens
- Ethereal passwords

Before pushing, check:
1. npm.cmd --prefix backend run build
2. npm.cmd --prefix frontend run build
3. npm.cmd --prefix backend test
4. docker compose config --quiet
5. git status does not show .env or secrets

Git commands:
cd C:\Users\manoj\Desktop\outbox
git init
git add .
git status
git commit -m "Build Email Scheduler application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/email-scheduler.git
git push -u origin main

After publishing, add the repository collaborator requested by the assignment and keep the repository private.

README must explain:
- Project purpose
- Architecture
- How React, Express, PostgreSQL, Redis, BullMQ, worker, SMTP, Elasticsearch, Slack, and Bull Board work together
- Docker setup
- Environment variables
- Google OAuth callback
- SMTP provider setup
- Individual recipient jobs
- Delay between emails
- Worker concurrency
- Redis hourly rate limiting
- Slack notification behavior
- Idempotency
- Restart persistence
- Elasticsearch search
- Bull Board monitoring
- Testing commands
- Demo flow
- Known limitations

The project brand and user-facing UI name must be Email Scheduler.
``` 
