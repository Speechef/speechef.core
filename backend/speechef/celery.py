import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'speechef.settings.development')

app = Celery('speechef')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# MM9.2 — nightly mentor badge evaluation
app.conf.beat_schedule = {
    'evaluate-mentor-badges-nightly': {
        'task': 'mentorship.tasks.evaluate_mentor_badges',
        'schedule': crontab(hour=2, minute=0),  # 02:00 UTC daily
    },
}
