# I1.4 — Production Deployment (Railway)

## Status: Done (CI/CD automated; Railway deploy requires manual dashboard steps — see tasks.md)

## Why
The app needs to be publicly accessible. Railway.app is recommended because:
- Deploys directly from GitHub
- Managed PostgreSQL + Redis included
- Automatic SSL
- Cheap (~$5/month for a small learning platform)
- No DevOps complexity — no Kubernetes, no EC2 setup

## Alternative: Render.com
Same benefits, slightly different interface. Either works.

## What
- Connect GitHub repo to Railway
- Set all env variables in Railway dashboard
- Configure `DJANGO_SETTINGS_MODULE=speechef.settings.production`
- Set up custom domain (optional)
- Configure GitHub Actions CI/CD to run tests before deploy

## Acceptance Criteria
- [ ] App live at a public URL with HTTPS
- [ ] All migrations applied on production DB
- [ ] Static files served correctly
- [ ] Media files served from Cloudflare R2 or AWS S3
- [ ] GitHub Actions runs tests on every PR
- [ ] Failing tests block deploy
