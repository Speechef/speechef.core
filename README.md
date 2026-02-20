# speechef.core

> **"Communicate your way to the top."**

Speechef is an all-in-one platform for mastering communication and public speaking — vocabulary games, curated learning content, peer feedback, and a jobs board for speaking roles.

---

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · TanStack Query · Zustand |
| **Backend** | Django 5 · Django REST Framework · SimpleJWT · Celery |
| **Database** | PostgreSQL 16 |
| **Cache / Queue** | Redis 7 |
| **Media Storage** | Cloudflare R2 |
| **Hosting** | Railway (backend) · Vercel (frontend) |

---

## Repository Layout

```
speechef.core/
├── backend/                  # Django (Python 3.12)
│   ├── home/
│   ├── users/
│   ├── learn/
│   ├── practice/             # Games + GameSession model
│   ├── jobs/
│   ├── speechef/             # Project config + settings package
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml
│
├── frontend/                 # Next.js (TypeScript)
│   ├── app/
│   │   ├── (public)/         # Landing page
│   │   ├── (auth)/           # login, register
│   │   └── (app)/            # dashboard, profile (auth-guarded)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── layout/           # Navbar
│   ├── hooks/                # useAuth, etc.
│   ├── lib/                  # api.ts (Axios + JWT interceptors), auth.ts
│   ├── stores/               # Zustand auth store
│   └── types/                # TypeScript interfaces
│
├── docs/                     # Architecture, vision, tech stack, developer guide
├── openspec/changes/         # Feature proposals (one folder per proposal)
├── .github/workflows/        # backend-ci.yml, frontend-ci.yml
├── docker-compose.yml        # Local dev: postgres + redis + django + frontend
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| [Homebrew](https://brew.sh) | latest (macOS) |
| Docker + Colima | installed via `dev.sh` automatically |
| Python | 3.12+ (manual setup only) |
| Node.js | 20+ LTS (manual setup only) |

### 1. Clone and configure

```bash
git clone https://github.com/Speechef/speechef.core.git
cd speechef.core

cp .env.example .env
# Edit .env — set SECRET_KEY at minimum for local dev
```

### 2. Start the full stack (recommended)

```bash
./dev.sh
```

This single command will:
- Install Docker CLI, docker-compose, and Colima via Homebrew (if not already present)
- Start the Colima VM (lightweight Docker runtime — no Docker Desktop needed)
- Build and start all services: Postgres, Redis, Django, Celery worker, Celery beat, and Next.js

| Service | URL |
|---|---|
| Next.js frontend | http://localhost:3000 |
| Django backend | http://localhost:8000 |
| Django admin | http://localhost:8000/admin |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

Press `Ctrl+C` to stop all services.

### Manual setup (alternative)

**Install dependencies (one-time, macOS):**

```bash
brew install docker docker-compose colima
mkdir -p ~/.docker/cli-plugins
ln -sfn "$(brew --prefix)/opt/docker-compose/bin/docker-compose" ~/.docker/cli-plugins/docker-compose
```

**Start Colima VM:**

```bash
colima start --cpu 2 --memory 4
```

**Build and start all services:**

```bash
docker compose up --build
```

**Stop all services:**

```bash
docker compose down
```

**Stop and wipe the database volume:**

```bash
docker compose down -v
```

---

## API Overview

Base path: `/api/v1/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/token/` | — | Obtain JWT access + refresh tokens |
| `POST` | `/token/refresh/` | — | Refresh access token |
| `POST` | `/auth/register/` | — | Create a new user account |
| `GET/PATCH` | `/auth/profile/` | Required | View or update user profile |
| `GET` | `/practice/question/` | — | Random vocabulary question |
| `POST` | `/practice/guess/` | Optional | Submit Guess the Word answer |
| `GET` | `/practice/memory-match/` | — | Word/meaning pairs for Memory Match |
| `GET` | `/practice/word-scramble/` | — | Scrambled word challenge |
| `POST` | `/practice/word-scramble/check/` | Optional | Submit Word Scramble answer |
| `GET` | `/practice/leaderboard/` | — | Top 10 players by score |
| `GET` | `/practice/sessions/` | Optional | Current user's recent game sessions |

Authenticated endpoints use `Authorization: Bearer <access_token>`.

---

## Running Tests

### Backend (14 tests)

```bash
cd backend
source .venv/bin/activate
python manage.py test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build    # catches all TypeScript + build errors
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Key variables:

```bash
SECRET_KEY=                    # Required — generate with Django's get_random_secret_key()
DEBUG=True                     # False in production
DATABASE_URL=postgres://speechef:speechef@localhost:5432/speechef
REDIS_URL=redis://localhost:6379/0
DJANGO_SETTINGS_MODULE=speechef.settings.development

# Production only
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SENTRY_DSN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Deployment

| Service | What deploys there | Trigger |
|---|---|---|
| **Railway** | Django + Postgres + Redis + Celery | Push to `main` |
| **Vercel** | Next.js frontend | Push to `main` |

CI (GitHub Actions) must pass before merges to `main`. See `.github/workflows/`.

---

## Docs

Full documentation lives in `docs/`:

- [`VISION.md`](docs/VISION.md) — Product vision and core pillars
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System design and data models
- [`TECH_STACK.md`](docs/TECH_STACK.md) — Package choices and rationale
- [`REPO_STRUCTURE.md`](docs/REPO_STRUCTURE.md) — Monorepo layout and branch strategy
- [`DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) — Daily workflow, migrations, common issues
- [`ROADMAP.md`](docs/ROADMAP.md) — Phased feature roadmap
