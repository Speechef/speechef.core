# Speechef — Deployment & CI/CD Guide

This guide covers everything you need to deploy Speechef end-to-end, set up CI/CD, and connect a custom domain — with the cheapest possible hosting stack.

---

## Cost Summary

| Tier | Cost | Suitable For |
|------|------|-------------|
| **All-Free** | $0/month | Portfolio, development, low-traffic (<100 users/day) |
| **Near-Free** | ~$5/month | Production apps, no cold starts, Celery workers |

> **Domain**: ~$10–15/year (one-time, not free). Recommended registrar: **Porkbun** or **Namecheap**.

---

## Recommended Free Stack

| Service | Provider | Free Tier |
|---------|----------|-----------|
| **Frontend (Next.js)** | [Vercel](https://vercel.com) | Unlimited deployments, edge CDN |
| **Backend (Django)** | [Render.com](https://render.com) | 1 web service (sleeps after 15 min inactivity) |
| **PostgreSQL** | [Neon.tech](https://neon.tech) | 0.5 GB, always-on, no sleep |
| **Redis (Celery broker)** | [Upstash](https://upstash.com) | 256 MB, 10,000 requests/day |
| **Media/File Storage** | [Cloudflare R2](https://r2.cloudflare.com) | 10 GB storage, 1M operations/month |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) | 2,000 min/month (private repo) |
| **DNS + CDN** | [Cloudflare](https://cloudflare.com) | Free DNS, free CDN proxy |

### Recommended Near-Free Stack (~$5/month, Production-Ready)

Use **Railway** instead of Render + Neon + Upstash separately:

| Service | Provider | Cost |
|---------|----------|------|
| **Backend + DB + Redis + Celery** | [Railway.app](https://railway.app) | $5/month (Hobby plan, no sleep) |
| **Frontend** | Vercel | Free |
| **Media Storage** | Cloudflare R2 | Free |
| **CI/CD** | GitHub Actions | Free |

> Your project already has `backend/railway.toml` configured — Railway is the easiest path.

---

## Part 1 — Frontend Deployment (Vercel)

Vercel is the company that makes Next.js. Free tier has no limits for hobby projects and includes built-in CI/CD (every push to main auto-deploys).

### Step 1.1 — Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **"Add New Project"**.
3. Import the `speechef.core` repository.

### Step 1.2 — Configure the Project
When prompted:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm ci`

### Step 1.3 — Set Environment Variables on Vercel
In the Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

> Replace `your-backend-domain.com` with your actual backend URL (set up in Part 2).

### Step 1.4 — Deploy
Click **Deploy**. Vercel will:
1. Install dependencies
2. Build the Next.js app
3. Deploy to a `.vercel.app` URL

Every future push to `main` will auto-redeploy. Pull requests get preview deployments automatically.

### Step 1.5 — Connect Custom Domain (After Purchasing)
1. In Vercel project → **Settings → Domains**.
2. Add your domain: `speechef.com` (or whatever you buy).
3. Vercel gives you DNS records to add in Cloudflare.
4. In Cloudflare DNS, add the records Vercel provides (usually an A record or CNAME).
5. SSL is automatic (Let's Encrypt via Vercel).

---

## Part 2 — Backend Deployment

Choose **Option A (Free, has cold starts)** or **Option B (~$5/month, no cold starts, recommended for production)**.

---

### Option A — Render.com (Free)

> **Limitation**: The free web service sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Celery background workers are NOT available on the free tier.

#### Step 2A.1 — Create Render Account
1. Go to [render.com](https://render.com) and sign up with GitHub.

#### Step 2A.2 — Create PostgreSQL Database (via Neon.tech)
1. Go to [neon.tech](https://neon.tech), sign up, create a new project named `speechef`.
2. Copy the **Connection String** (looks like `postgres://user:pass@host/dbname`).
3. Save this as `DATABASE_URL`.

#### Step 2A.3 — Create Redis (via Upstash)
1. Go to [upstash.com](https://upstash.com), sign up, click **Create Database**.
2. Choose **Redis**, region closest to your Render server (e.g., US East), enable **TLS**.
3. Copy the **Redis URL** (looks like `rediss://default:password@host:port`).
4. Save this as `REDIS_URL`.

#### Step 2A.4 — Create Web Service on Render
1. In Render dashboard, click **New → Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Name**: `speechef-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**:
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```
     gunicorn speechef.wsgi:application --bind 0.0.0.0:$PORT --workers 2
     ```
   - **Plan**: Free

#### Step 2A.5 — Set Environment Variables on Render
In the Render service → **Environment**, add all variables from the table in [Part 4](#part-4--environment-variables-reference).

---

### Option B — Railway (Recommended, ~$5/month)

> Your repo already has `backend/railway.toml` configured. Railway supports PostgreSQL, Redis, Celery workers, and Celery Beat all in one platform. No cold starts.

#### Step 2B.1 — Create Railway Account
1. Go to [railway.app](https://railway.app), sign up with GitHub.
2. Choose the **Hobby Plan** ($5/month).

#### Step 2B.2 — Create a New Project
1. Click **New Project → Deploy from GitHub repo**.
2. Select your repo, set **Root Directory** to `backend`.
3. Railway will detect `railway.toml` automatically and use nixpacks.

#### Step 2B.3 — Add PostgreSQL
1. In the Railway project, click **New Service → Database → PostgreSQL**.
2. Railway adds `DATABASE_URL` to your environment automatically.

#### Step 2B.4 — Add Redis
1. Click **New Service → Database → Redis**.
2. Railway adds `REDIS_URL` to your environment automatically.

#### Step 2B.5 — Add Celery Worker Service
1. Click **New Service → GitHub Repo** (same repo).
2. Set **Root Directory** to `backend`.
3. Override the **Start Command** to:
   ```
   celery -A speechef worker --loglevel=info
   ```
4. Add the same environment variables as the main web service.

#### Step 2B.6 — Add Celery Beat (Scheduler) — Optional
1. Click **New Service → GitHub Repo** (same repo again).
2. Set **Start Command** to:
   ```
   celery -A speechef beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
   ```
3. Add the same environment variables.

#### Step 2B.7 — Set Environment Variables
In Railway project → select the web service → **Variables**, add all variables from [Part 4](#part-4--environment-variables-reference).

#### Step 2B.8 — Connect Custom Domain
1. In Railway web service → **Settings → Networking**.
2. Click **Generate Domain** for a `.railway.app` URL, or add your custom domain.
3. Railway provides SSL certificates automatically.

---

## Part 3 — Media File Storage (Cloudflare R2)

R2 is Cloudflare's object storage (S3-compatible). Free tier: **10 GB storage, 1 million Class-A operations/month**.

### Step 3.1 — Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com), sign up.
2. In the dashboard, go to **R2 Object Storage**.

### Step 3.2 — Create a Bucket
1. Click **Create Bucket**, name it `speechef-media`.
2. Choose the region closest to your backend.

### Step 3.3 — Create API Token
1. In R2 settings → **Manage R2 API Tokens**.
2. Click **Create API Token**.
3. Permissions: **Object Read & Write**.
4. Scope: your `speechef-media` bucket.
5. Copy the **Access Key ID** and **Secret Access Key**.

### Step 3.4 — Set Custom Domain for Public Access
1. In R2 bucket → **Settings → Custom Domains**.
2. Add a subdomain like `media.yourdomain.com`.
3. Cloudflare will configure it automatically if your domain is on Cloudflare.

### Step 3.5 — Add R2 Variables to Backend
Add these to your backend environment (Render or Railway):

```
R2_ACCESS_KEY_ID=<from step 3.3>
R2_SECRET_ACCESS_KEY=<from step 3.3>
R2_BUCKET_NAME=speechef-media
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_CUSTOM_DOMAIN=media.yourdomain.com
```

> Find `<account-id>` in the Cloudflare dashboard under **R2 → Overview**.

---

## Part 4 — Environment Variables Reference

### Backend Environment Variables

Set all of these on Render (Option A) or Railway (Option B):

```env
# Core Django
SECRET_KEY=<generate a strong random key — use: python -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=False
DJANGO_SETTINGS_MODULE=speechef.settings.production
ALLOWED_HOSTS=your-backend-domain.com,api.yourdomain.com

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://default:password@host:6379

# CORS — set to your Vercel frontend URL
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://yourdomain.com

# AI
OPENAI_API_KEY=sk-...

# Cloudflare R2 (media storage)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=speechef-media
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_CUSTOM_DOMAIN=media.yourdomain.com

# Error Tracking (optional but recommended)
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend Environment Variables

Set on Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

---

## Part 5 — CI/CD with GitHub Actions

Your repo already has workflows in `.github/workflows/` — they are currently **commented out**. Follow the steps below to enable them.

### Step 5.1 — Enable Backend CI

Replace the entire contents of `.github/workflows/backend-ci.yml` with:

```yaml
name: Backend CI

on:
  push:
    branches: [main, dev]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [main, dev]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
          cache-dependency-path: backend/requirements.txt

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Django system check
        env:
          SECRET_KEY: ci-only-not-for-production
          DJANGO_SETTINGS_MODULE: speechef.settings.development
        run: python manage.py check

      - name: Run migrations
        env:
          SECRET_KEY: ci-only-not-for-production
          DJANGO_SETTINGS_MODULE: speechef.settings.development
        run: python manage.py migrate

      - name: Run tests
        env:
          SECRET_KEY: ci-only-not-for-production
          DJANGO_SETTINGS_MODULE: speechef.settings.development
        run: python manage.py test --verbosity=2
```

### Step 5.2 — Enable Frontend CI

Replace the entire contents of `.github/workflows/frontend-ci.yml` with:

```yaml
name: Frontend CI

on:
  push:
    branches: [main, dev]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main, dev]
    paths:
      - 'frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
```

### Step 5.3 — Add Auto-Deploy on Merge

**Frontend (Vercel)**: Auto-deploy is already enabled by default. Every push to `main` triggers a Vercel production deployment. No extra setup needed.

**Backend (Railway)**: Auto-deploy is also enabled by default when you link your GitHub repo. Every push to `main` triggers a Railway deployment.

**Backend (Render)**: In Render service → **Settings → Deploy**, enable **Auto-Deploy** and set the branch to `main`.

### Step 5.4 — Add GitHub Secrets (For Advanced CD)

If you want GitHub Actions to trigger Railway/Render deploys (instead of relying on their native GitHub integration), add secrets to your GitHub repo:

1. Go to GitHub repo → **Settings → Secrets and variables → Actions**.
2. Add:

| Secret Name | Where to Get It |
|-------------|----------------|
| `RAILWAY_TOKEN` | Railway dashboard → Settings → Tokens |
| `RENDER_API_KEY` | Render dashboard → Account Settings → API Keys |
| `VERCEL_TOKEN` | Vercel dashboard → Settings → Tokens |

> For most cases, the native GitHub integrations on Vercel/Railway/Render are sufficient and you don't need to add these secrets.

---

## Part 6 — Custom Domain Setup (Cloudflare)

### Step 6.1 — Purchase a Domain
- Recommended: [Porkbun](https://porkbun.com) (~$9/year for `.com`) or [Namecheap](https://namecheap.com)
- During checkout, you can choose to use Cloudflare for DNS management.

### Step 6.2 — Add Domain to Cloudflare
1. In Cloudflare dashboard, click **Add a Site**, enter your domain.
2. Choose the **Free plan**.
3. Cloudflare will scan existing DNS records.
4. Update your domain's **nameservers** at your registrar to point to Cloudflare's nameservers (Cloudflare will show you exactly which nameservers to use).

### Step 6.3 — Add DNS Records

In Cloudflare DNS dashboard, add the following records:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `CNAME` | `@` (or `www`) | `cname.vercel-dns.com` | Proxied (orange cloud) |
| `CNAME` | `api` | `your-backend.railway.app` or `your-backend.onrender.com` | Proxied |
| `CNAME` | `media` | `pub-xxx.r2.dev` | Proxied |

> Vercel provides the exact CNAME value when you add a domain in their dashboard.

### Step 6.4 — SSL/TLS
- Cloudflare provides free SSL for your domain automatically.
- In Cloudflare → **SSL/TLS → Overview**, set encryption mode to **Full (strict)**.

---

## Part 7 — Deployment Checklist

Run through this before going live:

### Backend
- [ ] `DEBUG=False` in production environment
- [ ] Strong `SECRET_KEY` set (not the default)
- [ ] `ALLOWED_HOSTS` includes your backend domain
- [ ] `CORS_ALLOWED_ORIGINS` includes your frontend domain
- [ ] `DATABASE_URL` points to production PostgreSQL
- [ ] `REDIS_URL` points to production Redis
- [ ] `OPENAI_API_KEY` set
- [ ] `DJANGO_SETTINGS_MODULE=speechef.settings.production`
- [ ] Migrations run successfully
- [ ] `collectstatic` completed
- [ ] Health check endpoint responds: `GET /api/v1/` → 200 OK
- [ ] R2 credentials set (for media uploads)

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] Build completes without errors
- [ ] PWA manifest and service worker load correctly
- [ ] Auth flow works (login, register, JWT refresh)
- [ ] API calls reach the backend (check browser network tab)

### CI/CD
- [ ] GitHub Actions workflows are uncommented and committed
- [ ] Test and build pass on push to `main`
- [ ] Auto-deploy triggers on merge to `main`

---

## Part 8 — Monitoring (Free)

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| [Sentry.io](https://sentry.io) | Error tracking for backend + frontend | 5,000 errors/month |
| [Better Uptime](https://betteruptime.com) | Uptime monitoring, alerts | 10 monitors free |
| Vercel Analytics | Frontend web analytics | Built into Vercel free |
| Railway Metrics | CPU/memory/request metrics | Built into Railway |

### Sentry Setup (Backend)
1. Go to [sentry.io](https://sentry.io), create account, new Django project.
2. Copy the DSN and add `SENTRY_DSN=https://...@sentry.io/...` to backend environment.
3. Sentry is already wired up in `speechef/settings/production.py` via `sentry-sdk`.

---

## Quick Reference — URLs After Deployment

Once deployed, your services will be accessible at:

| Service | URL |
|---------|-----|
| Frontend | `https://yourdomain.com` |
| Backend API | `https://api.yourdomain.com/api/v1/` |
| Django Admin | `https://api.yourdomain.com/admin/` |
| Media Files | `https://media.yourdomain.com/` |

---

## Troubleshooting

### "Application failed to respond" on Render
The free tier sleeps after 15 minutes. The first request wakes it up (takes ~30s). This is normal on the free tier. Upgrade to a paid plan or use Railway to avoid this.

### CORS errors in browser
Check that `CORS_ALLOWED_ORIGINS` in the backend environment includes your exact frontend URL (no trailing slash). Example: `https://speechef.vercel.app,https://speechef.com`

### Migrations fail on deploy
Ensure `DATABASE_URL` is correctly set. Test locally: `python manage.py migrate --settings=speechef.settings.production`

### Static files 404
Run `python manage.py collectstatic --noinput` and ensure `whitenoise` is in `MIDDLEWARE` (before `CommonMiddleware`). This is already configured in `production.py`.

### Media files not uploading
Check all 5 R2 environment variables are set. The R2 endpoint URL must include your Cloudflare account ID.
