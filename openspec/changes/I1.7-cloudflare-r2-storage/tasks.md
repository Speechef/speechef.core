# Tasks — I1.7 Cloudflare R2 Storage

- [x] Add `django-storages==1.14.2` and `boto3==1.34.0` to `backend/requirements.txt`
- [x] Add R2 config vars to `backend/speechef/settings/base.py` (all default to '' in dev)
- [x] Add conditional `STORAGES` block to `production.py` — activates only when `R2_ACCESS_KEY_ID` is set
- [x] Use `STORAGES` dict (Django 4.2+ API) to keep WhiteNoise for staticfiles alongside R2 for media
- [x] Add R2 env vars to `.env.example`
- [x] `pip install django-storages==1.14.2 boto3==1.34.0`
- [x] `python manage.py check` — 0 issues (dev mode, no R2 vars set)
