# I1.3 — Docker + Docker Compose

## Status: Done

## Why
- "Works on my machine" problem eliminated
- PostgreSQL + Redis run consistently across all dev environments
- Same Dockerfile used in production (no environment drift)
- Celery workers easy to add later

## Services (docker-compose.yml)
- `db` — PostgreSQL 16
- `redis` — Redis 7 (for Celery + caching later)
- `web` — Django app
- `celery` — Celery worker
- `celery-beat` — Celery scheduler
- `frontend` — Next.js dev server

## Acceptance Criteria
- [x] `docker compose up` starts the full stack
- [x] `docker compose run web python manage.py migrate` works
- [x] Django app accessible at `http://localhost:8000`
- [x] PostgreSQL data persisted via named volume
- [x] `.env` file used by Docker Compose for secrets
- [x] `Dockerfile` suitable for production build (no dev tools)
