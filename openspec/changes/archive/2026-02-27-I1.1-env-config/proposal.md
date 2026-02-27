# I1.1 — Environment Configuration (.env)

## Status: Done

## Why
`SECRET_KEY` is hardcoded in `settings.py` and exposed in version control.
`DEBUG=True` and `ALLOWED_HOSTS=[]` are unsafe for production. There is no
separation between development and production configuration.

## What
- Install `python-decouple` for `.env` management
- Move all secrets and environment-specific values to `.env`
- Create a `settings/` package with `base.py`, `development.py`, `production.py`
- Add `.env.example` to track required variables without exposing values

## Variables to Extract
- SECRET_KEY
- DEBUG
- ALLOWED_HOSTS
- DATABASE_URL (for Phase I1.2)
- MEDIA storage credentials (for Phase B1.3)

## Acceptance Criteria
- [x] No secrets in `settings.py` or any tracked file
- [x] `.env` added to `.gitignore`
- [x] `.env.example` committed with placeholder values
- [x] App runs correctly with `.env` file in place
- [x] `python manage.py check --deploy` passes all critical checks
