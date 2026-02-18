import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'speechef.settings.development')

app = Celery('speechef')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
