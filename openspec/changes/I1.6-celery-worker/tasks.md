# Tasks — I1.6 Celery Worker

- [ ] Add `celery==5.3.6` and `django-celery-beat==2.6.0` to `backend/requirements.txt`
- [ ] Create `backend/speechef/celery.py`
- [ ] Update `backend/speechef/__init__.py` to import celery app
- [ ] Add `CELERY_*` settings to `backend/speechef/settings/base.py`
- [ ] Add `django_celery_beat` to `INSTALLED_APPS` in base.py
- [ ] Add `celery` and `celery-beat` services to `docker-compose.yml`
- [ ] Run `docker compose up --build` — all 5 services should start
- [ ] Run `docker compose run web python manage.py migrate` — celery beat tables created
- [ ] Verify `celery` worker shows "ready" in logs
- [ ] Verify periodic tasks visible in Django admin
