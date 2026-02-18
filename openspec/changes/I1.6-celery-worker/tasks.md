# Tasks — I1.6 Celery Worker

- [x] Add `celery==5.3.6` and `django-celery-beat==2.6.0` to `backend/requirements.txt`
- [x] Create `backend/speechef/celery.py` — Celery app, config from Django settings, autodiscover_tasks
- [x] Update `backend/speechef/__init__.py` — import celery app so it loads with Django
- [x] Add `django_celery_beat` to `INSTALLED_APPS` in `base.py`
- [x] Add `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, serialiser, timezone settings to `base.py`
- [x] Add `celery` service to `docker-compose.yml` (worker, loglevel=info)
- [x] Add `celery-beat` service to `docker-compose.yml` (DatabaseScheduler)
- [x] `pip install celery==5.3.6 django-celery-beat==2.6.0`
- [x] `python manage.py check` — 0 issues
- [x] `python -c "from speechef.celery import app; print(app.main)"` — prints "speechef"
