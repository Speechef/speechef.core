# I1.3 — Docker + Docker Compose

## Status: Unblocked

## Why
- "Works on my machine" problem eliminated
- PostgreSQL + Redis run consistently across all dev environments
- Same Dockerfile used in production (no environment drift)
- Celery workers easy to add later

## Services (docker-compose.yml)
- `db` — PostgreSQL 16
- `redis` — Redis 7 (for Celery + caching later)
- `web` — Django app

## Acceptance Criteria
- [ ] `docker compose up` starts the full stack
- [ ] `docker compose run web python manage.py migrate` works
- [ ] Django app accessible at `http://localhost:8000`
- [ ] PostgreSQL data persisted via named volume
- [ ] `.env` file used by Docker Compose for secrets
- [ ] `Dockerfile` suitable for production build (no dev tools)
