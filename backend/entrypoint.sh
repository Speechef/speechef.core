#!/bin/bash
set -e

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "⏳ Running migrations..."
python manage.py migrate --noinput

echo "🌱 Loading seed data (skipped if already present)..."
python manage.py shell -c "
from practice.models import WordQuestion
if not WordQuestion.objects.exists():
    from django.core.management import call_command
    call_command('loaddata', 'fixtures/seed.json')
    print('Seed data loaded.')
else:
    print('Seed data already present — skipping.')
"

echo "👩‍🏫 Loading mentor seed data (skipped if already present)..."
python manage.py shell -c "
from mentorship.models import MentorProfile
if not MentorProfile.objects.filter(is_active=True).exists():
    from django.core.management import call_command
    call_command('loaddata', 'fixtures/mentors_seed.json')
    print('Mentor seed data loaded.')
else:
    print('Mentor data already present — skipping.')
"

echo "👤 Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
if password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print('Superuser created.')
else:
    print('Superuser already exists or password not set — skipping.')
"

echo "✅ Ready."
exec "$@"
