# I1.4 Tasks

## CI/CD (GitHub Actions)
- [ ] Create `.github/workflows/ci.yml`:
      - Trigger: push to main, all PRs
      - Steps: checkout, setup Python, install deps, run migrations, run tests
- [ ] Write at least one test per app (even smoke tests)

## Storage (Cloudflare R2)
- [ ] Create R2 bucket on Cloudflare dashboard
- [ ] `pip install django-storages boto3`; update `requirements.txt`
- [ ] Configure `DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'`
      with R2 endpoint in `settings/production.py`
- [ ] Add R2 credentials to `.env.example` and Railway env vars

## Railway Deployment
- [ ] Create Railway project, link to GitHub repo `Speechef/speechef.core`
- [ ] Add PostgreSQL and Redis plugins in Railway
- [ ] Set all env variables: SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, DATABASE_URL, R2 creds
- [ ] Set start command: `gunicorn speechef.wsgi:application --bind 0.0.0.0:$PORT`
- [ ] Set build command: `python manage.py collectstatic --noinput && python manage.py migrate`
- [ ] Verify app loads at Railway URL
- [ ] Add custom domain (optional)

## Post-deploy checks
- [ ] Register a new user → profile works
- [ ] Play Guess the Word → game works
- [ ] Admin panel accessible
- [ ] Static and media files load
