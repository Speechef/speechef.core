# Tech Stack

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                    │
│  Next.js 16.1.6 · React 19 · Tailwind v4 · TanStack Query 5 │
│  Zustand 5 · shadcn/ui · TypeScript                         │
│  Deployed on Vercel                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST / JSON over HTTPS
                        │ JWT in Authorization header
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND                                                     │
│  Django 5 · Django REST Framework 3 · SimpleJWT             │
│  OpenAI SDK (GPT-4o + GPT-4o-mini) · Celery 5              │
│  Deployed on Railway                                         │
└───────┬────────────────────┬────────────────────────────────┘
        │                    │
  ┌─────▼──────┐     ┌───────▼──────┐
  │ PostgreSQL  │     │   Redis 7    │
  │    16       │     │  cache +     │
  │  (Railway)  │     │  Celery      │
  └─────────────┘     └──────────────┘
        │
  ┌─────▼──────────────┐       ┌─────────────────────┐
  │  Cloudflare R2      │       │   OpenAI API         │
  │  (media storage)    │       │  GPT-4o (quality)    │
  └─────────────────────┘       │  GPT-4o-mini (speed) │
                                └─────────────────────┘
```

---

## Backend Stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `Django` | 5.0.x | Web framework, ORM, admin, auth |
| `djangorestframework` | 3.14.x | REST API layer |
| `djangorestframework-simplejwt` | 5.3.x | JWT access + refresh tokens |
| `django-cors-headers` | latest | CORS for Next.js → Django requests |

### AI

| Package | Version | Purpose |
|---|---|---|
| `openai` | ≥ 1.30 | GPT-4o writing coach, resume analyzer, interview sim, roleplay scoring |

**Usage pattern:**
```python
from openai import OpenAI
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Quality tasks (writing, resume, interview finish, roleplay score)
response = client.chat.completions.create(model="gpt-4o", ...)

# Speed tasks (roleplay turns, sentence builder feedback)
response = client.chat.completions.create(model="gpt-4o-mini", ...)
```

### Database & Caching

| Package | Version | Purpose |
|---|---|---|
| `psycopg2-binary` | 2.9.x | PostgreSQL driver |
| `dj-database-url` | latest | Parse `DATABASE_URL` env variable |
| `redis` | 5.0.x | Python Redis client |
| `django-redis` | 5.4.x | Use Redis as Django cache backend |

### Storage

| Package | Version | Purpose |
|---|---|---|
| `django-storages` | 1.14.x | Pluggable file storage backend |
| `boto3` | 1.34.x | Cloudflare R2 / AWS S3 client |
| `Pillow` | 10.x | Profile image resizing |

### Async Tasks

| Package | Version | Purpose |
|---|---|---|
| `celery` | 5.3.x | Background task queue |
| `django-celery-beat` | 2.6.x | Periodic tasks (streak resets, email digests) |

### Server & Config

| Package | Version | Purpose |
|---|---|---|
| `gunicorn` | latest | WSGI server for production |
| `whitenoise` | latest | Serve static files without a CDN |
| `python-decouple` | latest | `.env` management |
| `sentry-sdk` | 2.3.x | Error tracking (Python exceptions) |

---

## Frontend Stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.1.6 | React framework (App Router, SSR, SSG, CSR) |
| `react` | 19.2.3 | UI library |
| `typescript` | 5.x | Type safety |

### Styling & UI

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | 4.x | Utility-first CSS |
| `shadcn` | 3.8.x | Pre-built accessible component primitives |

### Data Fetching

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | 5.90.x | Server state: fetching, caching, mutation, invalidation |
| `axios` | 1.13.x | HTTP client with JWT Bearer interceptors |

### State Management

| Package | Version | Purpose |
|---|---|---|
| `zustand` | 5.0.x | Lightweight client state (auth, token refresh state) |

### Auth

| Package | Version | Purpose |
|---|---|---|
| `js-cookie` | latest | Read `access_token` cookie for API requests |

---

## Infrastructure & DevOps

### Local Development

| Tool | Purpose |
|---|---|
| **Colima** | Lightweight Docker VM for macOS (no Docker Desktop required) |
| **Docker Compose** | Orchestrate `db`, `redis`, `web`, `celery`, `celery-beat`, `frontend` |
| **`dev.sh`** | One-command stack launcher — installs Colima + starts all services |

### Hosting

| Service | What runs there | Cost |
|---|---|---|
| **Railway.app** | Django, PostgreSQL, Redis, Celery workers | ~$5–15/mo |
| **Vercel** | Next.js frontend | Free tier → Pro as traffic grows |
| **Cloudflare R2** | Media uploads (profile images, future speech recordings) | Free up to 10 GB |

### CI/CD

| Tool | Purpose |
|---|---|
| **GitHub Actions** | `backend-ci.yml` — Django tests on every PR |
| | `frontend-ci.yml` — `tsc --noEmit` + `next build` on every PR |

### Monitoring

| Tool | Purpose | Cost |
|---|---|---|
| **Sentry** | Python + JS error tracking | Free tier |
| **UptimeRobot** | Uptime alerts every 5 minutes | Free |
| **Railway metrics** | CPU, memory, request count | Included |

---

## Why These Choices

### Why Next.js over plain React (Vite)?
SEO matters for the landing page, learn articles, and job listings. Next.js SSG/SSR handles those pages, while CSR handles interactive game components — best of both worlds.

### Why Railway over AWS?
AWS requires DevOps expertise (VPC, ECS, RDS, IAM, security groups). Railway deploys Django with Postgres and Redis in minutes with zero infrastructure config. Right for an early product; easy to migrate later.

### Why Cloudflare R2 over AWS S3?
R2 has zero egress fees (S3 charges $0.09/GB outbound). For a media platform with profile images and future video uploads, egress costs add up quickly.

### Why Celery + Redis over alternatives?
Celery is the industry standard with the best documentation and integrations. Redis as the broker doubles as the Django cache layer — not an extra service to run.

### Why GPT-4o-mini for roleplay turns?
Latency matters in a conversation. GPT-4o-mini responds in ~1s vs ~3s for GPT-4o, at 1/15th the cost. We use GPT-4o only for final scoring, writing analysis, and resume review where quality outweighs speed.

### Why TanStack Query over SWR or manual fetch?
TanStack Query gives us query invalidation, optimistic updates, background refetch, and mutation state — all needed for the practice games and AI features. SWR lacks mutation handling. Manual fetch has no caching.

### Why Zustand over Redux?
Redux is overkill for this app's client-state needs. Zustand is 1 KB, zero boilerplate, and cleanly handles auth tokens and game state without reducers.

### Why shadcn/ui over MUI or Chakra?
shadcn/ui copies components into your codebase — fully owned, fully Tailwind-styled, zero bundle bloat. We override styles freely without fighting a theme system.

---

## Environment Variables Reference

```bash
# ── Django Backend ─────────────────────────────────────────────

# Required
SECRET_KEY=                    # python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DEBUG=False                    # True in development only
ALLOWED_HOSTS=                 # yourdomain.com,www.yourdomain.com
DATABASE_URL=                  # postgres://user:pass@host:5432/dbname
REDIS_URL=                     # redis://host:6379/0
DJANGO_SETTINGS_MODULE=        # speechef.settings.production
CORS_ALLOWED_ORIGINS=          # https://yourdomain.com

# AI (required for writing coach, resume analyzer, roleplay, interview sim)
OPENAI_API_KEY=

# Google OAuth (optional — login button hidden if blank)
GOOGLE_CLIENT_ID=

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=Speechef <noreply@speechef.com>

# Frontend URL (used in password reset links)
FRONTEND_URL=https://yourdomain.com

# Cloudflare R2 (production media storage)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=               # https://<account_id>.r2.cloudflarestorage.com
R2_CUSTOM_DOMAIN=              # Optional CDN domain

# Monitoring
SENTRY_DSN=

# ── Next.js Frontend ───────────────────────────────────────────

NEXT_PUBLIC_API_URL=           # https://api.yourdomain.com/api/v1
```
