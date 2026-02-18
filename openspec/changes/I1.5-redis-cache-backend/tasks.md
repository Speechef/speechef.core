# Tasks — I1.5 Redis Cache Backend

- [ ] Add `django-redis==5.4.0` to `backend/requirements.txt`
- [ ] Add `CACHES` config to `backend/speechef/settings/base.py`
- [ ] Add `SESSION_ENGINE` and `SESSION_CACHE_ALIAS` to `base.py`
- [ ] Update `.env.example` — confirm `REDIS_URL` is listed (already there)
- [ ] Run `docker compose up` and verify no errors
- [ ] Run `python manage.py check` — should pass
- [ ] Smoke test: login via Django admin, verify session written to Redis
