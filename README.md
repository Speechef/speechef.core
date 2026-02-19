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
| Docker Desktop | latest |
| Python | 3.12+ |
| Node.js | 20+ LTS |

### 1. Clone and configure

```bash
git clone https://github.com/Speechef/speechef.core.git
cd speechef.core

cp .env.example .env
# Edit .env — set SECRET_KEY at minimum for local dev
```

### 2. Start backing services

```bash
docker compose up -d db redis
```

### 3. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\Activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# → http://localhost:8000
# → http://localhost:8000/api/v1/   (DRF browsable API)
# → http://localhost:8000/admin/
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Or — run everything with Docker

```bash
docker compose up --build
# Django:   http://localhost:8000
# Next.js:  http://localhost:3000
# Postgres: localhost:5432
# Redis:    localhost:6379
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
