# Developer Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.12+ | `brew install python` |
| Node.js | 20+ LTS | `brew install node` |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| GitHub CLI | latest | `brew install gh` |
| Git | latest | pre-installed on macOS |

---

## Initial Setup

### 1. Clone and configure

```bash
git clone https://github.com/Speechef/speechef.core.git
cd speechef.core

# Copy env template
cp .env.example .env
# Edit .env with your values (see TECH_STACK.md for reference)
```

### 2. Start the stack

```bash
docker compose up -d       # Start Postgres + Redis in background
```

### 3. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# → http://localhost:8000
```

### 4. Frontend setup (Phase 7+)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

---

## Daily Development Workflow

```bash
# Start services
docker compose up -d

# Backend (in one terminal)
cd backend
source .venv/bin/activate
python manage.py runserver

# Frontend (in another terminal, Phase 7+)
cd frontend
npm run dev
```

---

## One-Command Start

```bash
./dev.sh
```

Starts the full stack (Postgres, Redis, Django, Celery, Next.js) via Docker. Access:

| Service | URL |
|---------|-----|
| Next.js | http://localhost:3000 |
| Django  | http://localhost:8000 |
| Admin   | http://localhost:8000/admin |

---

## Hot Reload / Live UI Changes

On macOS, Docker runs inside a Colima VM which breaks file-watching by default — Next.js HMR won't detect your edits even though `npm run dev` is running.

### Option A — Run Next.js natively (recommended)

Keep Docker for the backend services only, run the frontend directly on your Mac for instant HMR:

**Terminal 1** — backend:
```bash
docker compose up db redis web celery celery-beat
```

**Terminal 2** — frontend:
```bash
cd frontend
npm run dev
```

### Option B — Stay fully in Docker

`docker-compose.yml` already has `WATCHPACK_POLLING=true` set on the frontend service, which enables polling-based file watching through the VM boundary. File changes are picked up within ~1–2 seconds. Just use `./dev.sh` as normal.

> Django's `runserver` already hot-reloads Python changes in both options — the bind mount (`./backend:/app`) handles that.

---

## Working with OpenSpec

Every piece of work maps to an OpenSpec proposal. This keeps work intentional and tracked.

### Starting a new proposal
```bash
# 1. Check next-openspec.md for an unblocked proposal
# 2. Create a branch
git checkout dev
git pull origin dev
git checkout -b openspec/B1.1-fix-guess-empty-queryset

# 3. Read the proposal
cat openspec/changes/B1.1-fix-guess-empty-queryset/proposal.md
cat openspec/changes/B1.1-fix-guess-empty-queryset/tasks.md

# 4. Implement, checking off tasks as you go
# 5. Commit (see commit conventions below)
# 6. Push and open PR to dev
git push -u origin openspec/B1.1-fix-guess-empty-queryset
gh pr create --base dev --title "fix: Guard guess_the_word against empty queryset (B1.1)"
```

---

## Commit Conventions

```
type: Short description (Proposal ID)

Types:
  feat     New feature
  fix      Bug fix
  chore    Tooling, config, deps
  docs     Documentation only
  test     Tests only
  refactor Code change with no feature or bug fix

Examples:
  fix: Guard guess_the_word view against empty queryset (B1.1)
  feat: Add Memory Match game views and templates (G1.1)
  chore: Add Docker Compose with Postgres and Redis (I1.3)
  feat: DRF API foundation with JWT auth (A1.1)
```

---

## Running Tests

### Backend
```bash
cd backend
source .venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
open htmlcov/index.html

# Run a specific app
pytest practice/tests.py

# Run with Django test runner
python manage.py test
```

### Frontend (Phase 7+)
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm run build         # Production build (catches all errors)
```

---

## Django Admin

URL: `http://localhost:8000/admin/`

Use `createsuperuser` credentials. Admin is the primary content management interface for:
- Adding `WordQuestion` entries (used by all three games)
- Creating `Post` and `Category` entries for Learn
- Managing `Jobs` listings
- Viewing `GameSession` records

---

## API Development

### Testing endpoints locally
The DRF browsable API is enabled in development:
```
http://localhost:8000/api/v1/
```

Or use curl:
```bash
# Get token
curl -X POST http://localhost:8000/api/v1/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'

# Use token
curl http://localhost:8000/api/v1/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

### Adding a new API endpoint
1. Create serializer in `[app]/serializers.py`
2. Create view in `[app]/api_views.py` (keep separate from template views)
3. Register route in `speechef/api_urls.py`
4. Add to the API contract in `docs/ARCHITECTURE.md`

---

## Database Migrations

```bash
# After changing a model
python manage.py makemigrations [app_name]
python manage.py migrate

# Check migration plan without applying
python manage.py migrate --plan

# Reset a specific app's migrations (dev only, never production)
python manage.py migrate [app_name] zero
```

---

## Environment Separation

| Setting | Development | Production |
|---|---|---|
| `DEBUG` | `True` | `False` |
| `DATABASE_URL` | local Postgres via Docker | Railway Postgres |
| `REDIS_URL` | local Redis via Docker | Railway Redis |
| `DEFAULT_FILE_STORAGE` | local filesystem | Cloudflare R2 |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | `speechef.com,api.speechef.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | `https://speechef.com` |

Set via `DJANGO_SETTINGS_MODULE`:
```bash
# Development (default)
DJANGO_SETTINGS_MODULE=speechef.settings.development

# Production
DJANGO_SETTINGS_MODULE=speechef.settings.production
```

---

## Deployment

### Backend (Railway)
Deploys automatically on every push to `main` after CI passes.

Manual deploy:
```bash
# Railway CLI
railway up
```

### Frontend (Vercel)
Deploys automatically on every push to `main` after CI passes.

Manual deploy:
```bash
cd frontend
npx vercel --prod
```

### Running migrations in production
```bash
# Via Railway CLI
railway run python manage.py migrate

# Or via Railway dashboard → project → web service → shell
python manage.py migrate
```

---

## Common Issues

### `ModuleNotFoundError: No module named 'speechef'`
You're not in the `backend/` directory or the virtual environment is not active.
```bash
cd backend && source .venv/bin/activate
```

### Postgres connection refused
Docker isn't running or the container hasn't started.
```bash
docker compose up -d db
docker compose ps    # verify db is "running"
```

### `random.choice` IndexError on Guess the Word
The WordQuestion table is empty. Add questions via admin:
```
http://localhost:8000/admin/practice/wordquestion/add/
```

### Profile image not showing
`MEDIA_ROOT` and `MEDIA_URL` are not configured. See Proposal B1.3.

### CORS error from Next.js to Django
`CORS_ALLOWED_ORIGINS` in Django settings doesn't include `http://localhost:3000`.
Check `settings/development.py`.
