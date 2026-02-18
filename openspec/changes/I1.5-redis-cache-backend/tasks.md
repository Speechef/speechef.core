# Tasks — I1.5 Redis Cache Backend

- [x] Add `django-redis==5.4.0` to `backend/requirements.txt`
- [x] Add `CACHES` config to `backend/speechef/settings/base.py` (RedisCache, REDIS_URL from env, 5 min timeout)
- [x] Add `SESSION_ENGINE` and `SESSION_CACHE_ALIAS` to `base.py` (sessions stored in Redis)
- [x] `pip install django-redis==5.4.0`
- [x] `python manage.py check` — 0 issues
