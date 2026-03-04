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

echo "✅ Ready."
exec "$@"
