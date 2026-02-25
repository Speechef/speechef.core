"""
Management command to seed Badge objects.
Run: python manage.py seed_badges
"""
from django.core.management.base import BaseCommand
from users.models import Badge

BADGES = [
    ('first_analysis', '🎤', 'First Analysis', 'Completed your first AI speech analysis'),
    ('first_review', '🎓', 'Expert Review', 'Submitted your first expert review'),
    ('first_roleplay', '🎭', 'Role Player', 'Completed your first role play session'),
    ('first_mentor', '🧑‍🏫', 'First Session', 'Booked your first mentor session'),
    ('first_job_apply', '💼', 'Job Seeker', 'Applied to your first job on Speechef'),
    ('streak_7', '🔥', '7-Day Streak', 'Maintained a 7-day practice streak'),
    ('streak_30', '🌟', '30-Day Streak', 'Maintained a 30-day practice streak'),
    ('score_80', '🥈', 'Silver Communicator', 'Achieved a Speechef score of 80+'),
    ('score_90', '🥇', 'Gold Communicator', 'Achieved a Speechef score of 90+'),
    ('score_100', '💎', 'Perfect Score', 'Achieved a perfect Speechef score of 100'),
    ('blitz_10', '⚡', 'Blitz Starter', 'Scored 10+ in Vocabulary Blitz'),
    ('blitz_20', '🚀', 'Blitz Master', 'Scored 20+ in Vocabulary Blitz'),
    ('games_10', '🎮', 'Gamer', 'Played 10 practice games'),
    ('daily_7', '📅', 'Daily Devotee', 'Completed 7 daily challenges'),
    ('review_delivered', '✅', 'Feedback Received', 'Received your first expert feedback delivery'),
]


class Command(BaseCommand):
    help = 'Seed Badge objects into the database'

    def handle(self, *args, **options):
        created = 0
        for badge_type, emoji, name, description in BADGES:
            _, was_created = Badge.objects.get_or_create(
                badge_type=badge_type,
                defaults={'emoji': emoji, 'name': name, 'description': description},
            )
            if was_created:
                created += 1
                self.stdout.write(f'  Created: {emoji} {name}')
        self.stdout.write(self.style.SUCCESS(
            f'Done — {created} badge(s) created, {len(BADGES) - created} already existed.'
        ))
