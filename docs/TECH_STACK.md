# Tech Stack

## Overview

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                                │
│  Next.js 15 · Tailwind CSS · shadcn/ui · TanStack Query │
│  Deployed on Vercel                                      │
└───────────────────────┬─────────────────────────────────┘
                        │ REST / JSON over HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND                                                 │
│  Django 5 · Django REST Framework · SimpleJWT            │
│  Celery · WhiteNoise · django-storages                   │
│  Deployed on Railway                                     │
└───────┬────────────────────┬────────────────────────────┘
        │                    │
  ┌─────▼──────┐     ┌───────▼──────┐
  │ PostgreSQL  │     │   Redis 7    │
  │    16       │     │  cache +     │
  │  (Railway)  │     │  Celery      │
  └─────────────┘     └──────────────┘
        │
  ┌─────▼──────────────┐
  │  Cloudflare R2      │
  │  (media storage)    │
  └─────────────────────┘
```

---

## Backend Stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `Django` | 5.x | Web framework, ORM, admin, auth |
| `djangorestframework` | 3.x | REST API layer |
| `djangorestframework-simplejwt` | latest | JWT authentication |
| `django-cors-headers` | latest | CORS for Next.js → Django requests |

### Database & Caching

| Package | Version | Purpose |
|---|---|---|
| `psycopg2-binary` | latest | PostgreSQL driver |
| `dj-database-url` | latest | Parse DATABASE_URL env variable |
| `redis` | latest | Python Redis client |
| `django-redis` | latest | Use Redis as Django cache backend |

### Storage

| Package | Version | Purpose |
|---|---|---|
| `django-storages` | latest | Pluggable file storage backend |
| `boto3` | latest | AWS S3 / Cloudflare R2 client |
| `Pillow` | 10.x | Profile image resizing |

### Async Tasks

| Package | Version | Purpose |
|---|---|---|
| `celery` | 5.x | Background task queue |
| `django-celery-beat` | latest | Periodic tasks (streak resets, email digests) |

### Configuration & Server

| Package | Version | Purpose |
|---|---|---|
| `python-decouple` | latest | `.env` management |
| `gunicorn` | latest | WSGI server for production |
| `whitenoise` | latest | Serve static files without a CDN |

### Monitoring

| Package | Version | Purpose |
|---|---|---|
| `sentry-sdk` | latest | Error tracking (Python exceptions) |

### Dev Tools

| Package | Version | Purpose |
|---|---|---|
| `pytest-django` | latest | Django testing with pytest |
| `factory-boy` | latest | Model factories for tests |
| `coverage` | latest | Code coverage reports |

---

## Frontend Stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `next` | 15.x | React framework (App Router, SSR, SSG) |
| `react` | 19.x | UI library |
| `typescript` | 5.x | Type safety |

### Styling & UI

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | 3.x | Utility-first CSS |
| `shadcn/ui` | latest | Pre-built accessible component library |
| `lucide-react` | latest | Icon library (used by shadcn/ui) |
| `framer-motion` | latest | Animations (card flips, transitions) |

### Data Fetching

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | 5.x | Server state management, caching, refetch |
| `axios` | 1.x | HTTP client with JWT interceptors |

### State Management

| Package | Version | Purpose |
|---|---|---|
| `zustand` | 4.x | Lightweight client state (auth, game state) |

### Forms

| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | 7.x | Performant form handling |
| `zod` | 3.x | Schema validation (shared with API contract) |

### Dev Tools

| Package | Version | Purpose |
|---|---|---|
| `eslint` | latest | Linting |
| `prettier` | latest | Code formatting |

---

## Infrastructure & DevOps

### Local Development

| Tool | Purpose |
|---|---|
| **Docker Desktop** | Run Postgres + Redis locally |
| **Docker Compose** | Orchestrate `db`, `redis`, `web` services |

### Hosting

| Service | What runs there | Cost |
|---|---|---|
| **Railway.app** | Django, PostgreSQL, Redis | ~$5–15/mo |
| **Vercel** | Next.js frontend | Free tier |
| **Cloudflare R2** | Media uploads (images, future videos) | Free up to 10GB |

### CI/CD

| Tool | Purpose |
|---|---|
| **GitHub Actions** | Run tests on every PR, block merge on failure |

### Monitoring

| Tool | Purpose | Cost |
|---|---|---|
| **Sentry** | Python + JS error tracking | Free tier |
| **UptimeRobot** | Uptime alerts every 5 min | Free |
| **Railway metrics** | CPU, memory, request count | Included |

---

## Why These Choices

### Why Next.js over plain React (Vite)?
SEO matters for the landing page, learn articles, and job listings. Next.js gives SSR/SSG for those pages while still allowing CSR for the interactive game components.

### Why Railway over AWS?
AWS is powerful but requires DevOps expertise (VPC, ECS, RDS, IAM). Railway deploys a Django app with Postgres and Redis in 10 minutes with zero infrastructure config. Right choice for an early-stage product.

### Why Cloudflare R2 over AWS S3?
R2 has zero egress fees (vs S3's $0.09/GB egress). For a media-heavy platform (profile pics, future video uploads), this matters significantly at scale.

### Why Celery + Redis over Django-Q or Huey?
Celery is the industry standard, best documentation, and most integrations. Redis as the broker doubles as a cache layer, so it's not an extra service.

### Why shadcn/ui over MUI or Chakra?
shadcn/ui components are copied into your codebase (not installed as a black box), fully styled with Tailwind, and accessible by default. Zero bundle bloat from unused components.

### Why Zustand over Redux?
Redux is overkill for this application's client state needs. Zustand is 1KB, no boilerplate, and handles auth tokens + game state cleanly.

---

## Environment Variables Reference

```bash
# Django Backend
SECRET_KEY=                    # Django secret key (generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
DEBUG=False                    # True in development only
ALLOWED_HOSTS=                 # Comma-separated: yourdomain.com,www.yourdomain.com
DATABASE_URL=                  # postgres://user:pass@host:5432/dbname
REDIS_URL=                     # redis://host:6379/0
DJANGO_SETTINGS_MODULE=        # speechef.settings.production

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=               # https://<account_id>.r2.cloudflarestorage.com
R2_CUSTOM_DOMAIN=              # Optional CDN domain for serving files

# Sentry
SENTRY_DSN=

# Next.js Frontend
NEXT_PUBLIC_API_URL=           # https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SENTRY_DSN=
```
