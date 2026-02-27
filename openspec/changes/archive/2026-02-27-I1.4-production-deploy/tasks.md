# I1.4 Tasks

## CI/CD — GitHub Actions (Done)
- [x] Create `.github/workflows/backend-ci.yml`
      - Triggers on push/PR to main or dev (backend/** paths)
      - Steps: checkout → Python 3.12 → pip install → manage.py check → migrate → test
      - Uses SQLite (development settings) — no Postgres service needed in CI
- [x] Create `.github/workflows/frontend-ci.yml`
      - Triggers on push/PR to main or dev (frontend/** paths)
      - Steps: checkout → Node 20 → npm ci → lint → build
- [x] Write 14 smoke tests across all Django apps + API (14/14 passing)
      - home: home_index returns 200
      - learn: learn_index + learn_category return 200
      - jobs: jobs_index returns 200
      - practice: practice_index + word_scramble (empty DB) return 200
      - users: login/register pages 200, profile redirect 302, user registration
      - speechef: API root 200, token endpoint 401 on bad creds, 200 + tokens on valid creds, landing page 200
- [x] Fix: moved CompressedManifestStaticFilesStorage to production.py only
      (base.py used it, which broke tests that don't run collectstatic)

## Railway Config (Done)
- [x] Create `backend/railway.toml`
      - buildCommand: pip install + collectstatic + migrate
      - startCommand: gunicorn on $PORT with 2 workers
      - healthcheckPath: /api/v1/

## Railway Dashboard (Manual steps — requires Railway account)
- [ ] Go to https://railway.app → New Project → Deploy from GitHub repo
- [ ] Select repo: Speechef/speechef.core
- [ ] Set Root Directory to: `backend/`  ← critical for monorepo
- [ ] Add PostgreSQL plugin → Railway auto-sets DATABASE_URL
- [ ] Add Redis plugin → Railway auto-sets REDIS_URL
- [ ] Set environment variables in Railway dashboard:
      SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
      DEBUG=False
      DJANGO_SETTINGS_MODULE=speechef.settings.production
      ALLOWED_HOSTS=<your-railway-domain>.up.railway.app
      CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>.vercel.app
      R2_ACCESS_KEY_ID=<from Cloudflare>
      R2_SECRET_ACCESS_KEY=<from Cloudflare>
      R2_BUCKET_NAME=speechef-media
      R2_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
      R2_CUSTOM_DOMAIN=<your R2 custom domain>
- [ ] Deploy and verify app loads at Railway URL
- [ ] Visit /api/v1/ → JSON root response
- [ ] Visit /admin/ → admin login works
- [ ] Add custom domain (optional)

## Post-deploy Smoke Checks
- [ ] Register a new user → profile page loads
- [ ] Log in → dashboard loads
- [ ] Visit /learn/ → posts list loads
- [ ] Visit /practice/ → game hub loads
- [ ] Static files load (CSS, no 404s)
- [ ] Media upload (profile pic) → file appears in R2 bucket
