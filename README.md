# speechef.core

> **"Communicate your way to the top."**

Speechef is an all-in-one English communication platform — vocabulary games, structured learning, AI-powered practice, speech analysis, mentoring, and a jobs board. **V1 is live.**

---

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.1.6 (App Router) · React 19 · Tailwind v4 · TanStack Query 5 · Zustand 5 |
| **Backend** | Django 5 · Django REST Framework 3 · SimpleJWT · Celery 5 |
| **AI** | OpenAI GPT-4o / GPT-4o-mini (writing coach, resume analyzer, roleplay, interview sim) |
| **Database** | PostgreSQL 16 |
| **Cache / Queue** | Redis 7 |
| **Media Storage** | Cloudflare R2 |
| **Hosting** | Railway (backend) · Vercel (frontend) |

---

## What's in V1

| Feature | Details |
|---|---|
| **Recipe Book (Learn)** | Structured articles by category · bookmarks · completion tracking · Speechef meter |
| **Word Games** | Vocabulary Blitz · Guess the Word · Memory Match · Word Scramble · Sentence Builder · Pronunciation Challenge |
| **AI Roleplay** | Job Interview · Presentation Pitch · Debate · Small Talk — real-time GPT-4o-mini conversations |
| **Interview Simulation** | Text-based mock interviews (behavioral / technical / HR / mixed) with per-answer scoring |
| **Test Prep** | IELTS Academic · TOEFL iBT · PTE Academic · OET · CELPIP structured tracks |
| **AI Writing Coach** | Grammar, vocabulary & structure feedback powered by GPT-4o |
| **Resume Analyzer** | ATS score, phrase improvements, keyword suggestions |
| **Vocabulary Hub** | 550+ academic word tracker + personal saved words list |
| **Daily Challenge** | One featured vocabulary challenge per day |
| **Speech Analysis** | Record speech → AI scores fluency, vocabulary, pace (Speechef Communication Score) |
| **Dashboard** | Journey level · streak · skill breakdown · score trend · weekly goal · leaderboard |
| **Mentors** | Browse mentor profiles · book 1-on-1 sessions · follow mentors · apply to mentor |
| **Community** | Q&A forum with threads · replies · upvotes · accept best answer |
| **Jobs** | Job listings for communication roles + application tracking |
| **PWA** | Installable as a home-screen app · offline fallback via service worker |

---

## Repository Layout

```
speechef.core/
├── backend/                  # Django (Python 3.12)
│   ├── users/                # Auth, profiles, JWT
│   ├── learn/                # Articles, categories, bookmarks, completions
│   ├── practice/             # Word games, GameSession, saved words, daily challenge
│   ├── roleplay/             # AI roleplay sessions (GPT-4o-mini turns)
│   ├── interview/            # Text-based interview simulation
│   ├── writing/              # Writing coach + resume analyzer
│   ├── analysis/             # Speech analysis (Speechef Communication Score)
│   ├── mentorship/           # Mentor profiles, bookings, follow, applications
│   ├── community/            # Threads, replies, votes
│   ├── jobs/                 # Job listings and applications
│   ├── testprep/             # Exam prep tracks
│   ├── review/               # Peer speech review (post-V1)
│   ├── home/                 # Dashboard data aggregation
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
│   │   ├── (public)/         # Landing page, share cards
│   │   ├── (auth)/           # login, register, password reset
│   │   ├── (app)/            # dashboard, profile (auth-guarded)
│   │   ├── (games)/          # learn, practice, jobs, analyze, mentors, community
│   │   └── api/              # Next.js route handlers (OG images)
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── layout/           # Navbar, Footer
│   │   └── dashboard/        # ScorecardWidget, etc.
│   ├── lib/                  # api.ts (Axios + JWT interceptors)
│   ├── stores/               # Zustand auth store
│   └── public/               # manifest.json, sw.js, icons
│
├── docs/                     # Architecture, vision, tech stack, roadmap
├── openspec/changes/         # Feature proposal history
├── .github/workflows/        # CI: backend tests + frontend lint/build
├── docker-compose.yml        # Local dev: postgres + redis + django + frontend
├── dev.sh                    # One-command local dev launcher (Colima)
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| macOS | Any recent version |
| [Homebrew](https://brew.sh) | latest |
| Docker + Colima | installed automatically by `dev.sh` |

### 1. Clone and configure

```bash
git clone https://github.com/Speechef/speechef.core.git
cd speechef.core

cp .env.example .env
# Edit .env — add your OPENAI_API_KEY for AI features
```

### 2. Start the full stack

```bash
./dev.sh
```

This single script installs Docker CLI, docker-compose, and Colima (if not present), then builds and starts all services:

| Service | URL |
|---|---|
| Next.js frontend | http://localhost:3000 |
| Django backend | http://localhost:8000 |
| Django admin | http://localhost:8000/admin (admin / Speechef@Admin2026) |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Press `Ctrl+C` to stop.

### Manual setup (alternative)

```bash
# Start Colima VM
colima start --cpu 2 --memory 4

# Build and start all containers
docker compose up --build

# Stop
docker compose down

# Stop + wipe database
docker compose down -v
```

### Run migrations manually

```bash
docker exec speechefcore-web-1 python manage.py migrate
docker exec speechefcore-web-1 python manage.py createsuperuser
```

---

## Environment Variables

Copy `.env.example` → `.env`. Critical variables:

```bash
# Required
SECRET_KEY=               # python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DEBUG=True                # False in production
DATABASE_URL=postgres://speechef:speechef@localhost:5432/speechef
REDIS_URL=redis://localhost:6379/0
DJANGO_SETTINGS_MODULE=speechef.settings.development

# AI features (writing coach, resume analyzer, roleplay, interview sim)
OPENAI_API_KEY=           # https://platform.openai.com/api-keys

# Google OAuth (optional — button hidden until set)
GOOGLE_CLIENT_ID=

# Email (blank in dev → prints to console)
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Production only
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SENTRY_DSN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=
```

---

## API Overview

Base path: `http://localhost:8000/api/v1/`

All authenticated endpoints require `Authorization: Bearer <access_token>`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/token/` | — | Obtain JWT access + refresh tokens |
| `POST` | `/token/refresh/` | — | Refresh access token |
| `POST` | `/auth/register/` | — | Create account |
| `GET/PATCH` | `/auth/profile/` | Required | View / update profile |
| `POST` | `/auth/change-password/` | Required | Change password |
| `POST` | `/auth/password-reset/` | — | Send reset email |
| `POST` | `/auth/google/` | — | Google OAuth login |

### Learn
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/learn/posts/` | — | List articles (filter by category/search) |
| `GET` | `/learn/posts/{id}/` | — | Article detail |
| `GET` | `/learn/categories/` | — | All categories |
| `POST` | `/learn/posts/{id}/bookmark/` | Required | Toggle bookmark |
| `POST` | `/learn/posts/{id}/complete/` | Required | Mark as complete |

### Practice
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/practice/question/` | — | Random vocabulary question |
| `POST` | `/practice/guess/` | Optional | Submit Guess the Word answer |
| `GET` | `/practice/memory-match/` | — | Word/meaning pairs |
| `GET/POST` | `/practice/word-scramble/` | Optional | Scrambled word challenge |
| `GET/POST` | `/practice/sentence-builder/` | Optional | Sentence building challenge |
| `GET` | `/practice/daily-challenge/` | — | Today's daily challenge |
| `GET` | `/practice/sessions/` | Optional | User's game history |
| `GET/POST` | `/practice/saved-words/` | Required | List / save personal words |
| `DELETE` | `/practice/saved-words/{id}/` | Required | Remove saved word |
| `GET` | `/practice/vocab-words/` | — | Academic vocabulary list |
| `GET` | `/practice/leaderboard/` | — | Top players by score |

### Roleplay
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/roleplay/start/` | Required | Start AI roleplay session |
| `POST` | `/roleplay/{id}/turn/` | Required | Send message, get AI response |
| `POST` | `/roleplay/{id}/finish/` | Required | End session + get score |
| `GET` | `/roleplay/sessions/` | Required | User's roleplay history |

### Interview Simulation
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/interview/start/` | Required | Start mock interview session |
| `POST` | `/interview/{id}/answer/` | Required | Submit answer, get feedback + next question |
| `POST` | `/interview/{id}/finish/` | Required | End + get final report |
| `GET` | `/interview/my/` | Required | User's interview history |

### Writing & Resume
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/writing/analyze/` | Required | AI writing coach feedback |
| `POST` | `/writing/resume/analyze/` | Required | Resume / ATS analysis |
| `GET` | `/writing/sessions/` | Required | Writing session history |
| `GET` | `/writing/resume/sessions/` | Required | Resume session history |

### Mentors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/mentors/` | — | List mentor profiles |
| `GET` | `/mentors/{id}/` | — | Mentor detail |
| `POST` | `/mentors/{id}/follow/` | Required | Toggle follow |
| `POST` | `/mentors/{id}/book/` | Required | Book a session |
| `POST` | `/mentors/apply/` | Required | Apply to become a mentor |
| `GET` | `/mentors/apply/status/` | Required | Application status |

### Community
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET/POST` | `/community/threads/` | Get: — / Post: Required | List / create threads |
| `GET` | `/community/threads/{id}/` | — | Thread + replies |
| `POST` | `/community/threads/{id}/replies/` | Required | Add reply |
| `POST` | `/community/threads/{id}/vote/` | Required | Toggle upvote |
| `POST` | `/community/replies/{id}/accept/` | Required | Accept best answer |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/jobs/` | — | List job listings |
| `GET` | `/jobs/{id}/` | — | Job detail |
| `GET/POST` | `/jobs/applications/` | Required | List / submit application |

---

## Running Tests

```bash
# Backend
docker exec speechefcore-web-1 python manage.py test

# Frontend — type check + build
cd frontend
npx tsc --noEmit
npm run build

# Frontend — lint
npm run lint
```

---

## Deployment

| Service | What runs there | Deploy trigger |
|---|---|---|
| **Railway** | Django · PostgreSQL · Redis · Celery | Push to `main` |
| **Vercel** | Next.js frontend | Push to `main` |

See `backend/railway.toml` for Railway config and `frontend/vercel.json` (if present) for Vercel overrides.

---

## Branch Strategy

```
main        ← production-ready only · protected · auto-deploys
dev         ← integration branch · PRs merge here first
feature/*   ← one branch per feature
hotfix/*    ← urgent fixes · PR directly to main
```

---

## Docs

| File | Contents |
|---|---|
| [`docs/VISION.md`](docs/VISION.md) | Product vision, pillars, V1 feature set |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data flows, database schema |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Package choices and rationale |
| [`docs/REPO_STRUCTURE.md`](docs/REPO_STRUCTURE.md) | Monorepo layout and branch strategy |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | V1 shipped · V2+ feature pipeline |
