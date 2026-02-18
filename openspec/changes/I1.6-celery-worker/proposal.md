# I1.6 — Celery Worker

## Status
Unblocked (requires I1.3 — Redis running as broker)

## Problem
The architecture diagram includes a Celery Worker service for:
- Sending transactional emails (registration, password reset)
- Resetting daily streaks at midnight
- Future: video processing

None of this exists. Without Celery, async tasks block the web request or don't happen at all.

## Solution
Add Celery with Redis as the broker and result backend. Add `celery` service to
docker-compose. Add `django-celery-beat` for periodic tasks (streak reset cron).

## Changes

### `backend/requirements.txt`
Add:
```
celery==5.3.6
django-celery-beat==2.6.0
```

### `backend/speechef/celery.py`
```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'speechef.settings.development')

app = Celery('speechef')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

### `backend/speechef/__init__.py`
```python
from .celery import app as celery_app
__all__ = ('celery_app',)
```

### `backend/speechef/settings/base.py`
Add:
```python
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

INSTALLED_APPS += ['django_celery_beat']
```

### `docker-compose.yml`
Add `celery` service:
```yaml
  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A speechef worker --loglevel=info
    volumes:
      - ./backend:/app
    env_file: .env
    environment:
      - DJANGO_SETTINGS_MODULE=speechef.settings.development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A speechef beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - ./backend:/app
    env_file: .env
    environment:
      - DJANGO_SETTINGS_MODULE=speechef.settings.development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
```

## Acceptance Criteria
- `docker compose up` starts `web`, `celery`, `celery-beat` alongside `db` and `redis`
- `celery -A speechef inspect ping` returns a response
- `python manage.py migrate` applies `django_celery_beat` migrations cleanly
- A test task (`celery_app.send_task('celery.ping')`) executes without error
- Periodic tasks table visible in Django admin under "Periodic Tasks"
