# I1.7 — Cloudflare R2 Media Storage

## Status
Done

## Problem
Profile images and future media files are stored locally on the server filesystem.
This breaks in production because:
1. Railway's filesystem is ephemeral (resets on deploy)
2. Files can't be shared across multiple web workers

The architecture specifies Cloudflare R2 for all media storage (zero egress fees vs S3).

## Solution
Install `django-storages` and `boto3`. Configure Django's `DEFAULT_FILE_STORAGE` to point
to R2 in production. Development keeps local filesystem storage.

## Changes

### `backend/requirements.txt`
Add:
```
django-storages==1.14.2
boto3==1.34.0
```

### `backend/speechef/settings/base.py`
Add R2 config (reads from env, safe to define in base since values are empty without env vars):
```python
# Cloudflare R2 — populated in production via env vars
R2_ACCESS_KEY_ID = config('R2_ACCESS_KEY_ID', default='')
R2_SECRET_ACCESS_KEY = config('R2_SECRET_ACCESS_KEY', default='')
R2_BUCKET_NAME = config('R2_BUCKET_NAME', default='')
R2_ENDPOINT_URL = config('R2_ENDPOINT_URL', default='')
R2_CUSTOM_DOMAIN = config('R2_CUSTOM_DOMAIN', default='')
```

### `backend/speechef/settings/production.py`
Add after existing imports:
```python
# Use Cloudflare R2 for media in production
if R2_ACCESS_KEY_ID:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID = R2_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = R2_SECRET_ACCESS_KEY
    AWS_STORAGE_BUCKET_NAME = R2_BUCKET_NAME
    AWS_S3_ENDPOINT_URL = R2_ENDPOINT_URL
    AWS_S3_CUSTOM_DOMAIN = R2_CUSTOM_DOMAIN
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    MEDIA_URL = f'https://{R2_CUSTOM_DOMAIN}/'
```

### `.env.example`
Add:
```
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=
R2_CUSTOM_DOMAIN=
```

## Development Behaviour
- No R2 env vars set → uses local `media/` folder (current behaviour, unchanged)
- R2 env vars set → uploads go to R2 bucket automatically

## Acceptance Criteria
- `python manage.py check` passes with and without R2 env vars
- In development: profile image upload saves to `backend/media/`
- In production (R2 vars set): upload goes to R2 bucket, URL uses custom domain
- No local media files committed to git (`media/` is gitignored)
