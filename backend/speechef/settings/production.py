from .base import *
import dj_database_url
import sentry_sdk
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

DATABASES = {'default': dj_database_url.config(default=config('DATABASE_URL'))}

# Sentry — error tracking (only active when SENTRY_DSN is set)
_sentry_dsn = config('SENTRY_DSN', default='')
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        traces_sample_rate=0.2,   # 20% of requests traced for performance
        send_default_pii=False,
    )

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=lambda v: [s.strip() for s in v.split(',')])

# WhiteNoise manifest storage for production static files
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# Cloudflare R2 media storage (active only when R2_ACCESS_KEY_ID is set)
if R2_ACCESS_KEY_ID:
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
    AWS_ACCESS_KEY_ID = R2_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = R2_SECRET_ACCESS_KEY
    AWS_STORAGE_BUCKET_NAME = R2_BUCKET_NAME
    AWS_S3_ENDPOINT_URL = R2_ENDPOINT_URL
    AWS_S3_CUSTOM_DOMAIN = R2_CUSTOM_DOMAIN
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    MEDIA_URL = f'https://{R2_CUSTOM_DOMAIN}/'
