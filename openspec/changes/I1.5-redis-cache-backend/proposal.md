# I1.5 — Redis Cache Backend

## Status
Unblocked (requires I1.3 — Docker/Redis running)

## Problem
Redis is running in docker-compose but Django has no CACHES configuration pointing to it.
The architecture diagram shows Redis serving "Query cache" and "API rate limit" — neither works
until Django is wired to use Redis as its cache backend.

## Solution
Install `django-redis` and configure Django's `CACHES` setting to use Redis.
Add cache decorators to the most expensive queries (random question lookup, leaderboard).

## Changes

### `backend/requirements.txt`
Add:
```
django-redis==5.4.0
```

### `backend/speechef/settings/base.py`
Add:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Use Redis for Django sessions too
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### `backend/docker-compose.yml` (no change needed)
Redis service already present. REDIS_URL already in `.env`.

## Acceptance Criteria
- `django.core.cache.cache.set('test', 1)` works without error
- `python manage.py check` passes
- Session data stored in Redis (verify via `redis-cli keys "*"` after login)
- Cache can be cleared with `python manage.py shell -c "from django.core.cache import cache; cache.clear()"`
