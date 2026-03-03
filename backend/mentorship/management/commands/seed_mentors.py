from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from mentorship.models import MentorProfile, MentorAvailability, MentorBundle


MENTORS = [
    {
        'username': 'gagandeep',
        'email': 'gagandeep@speechef.com',
        'password': 'mentor123',
        'first_name': 'Gagandeep',
        'last_name': 'Manku',
        'profile': {
            'bio': (
                "Hi! I'm Gagandeep, a communication coach with 6+ years of experience helping "
                "students and professionals master English for interviews, presentations, and everyday "
                "conversations. I specialize in reducing accent barriers and building confident speaking "
                "habits through structured feedback and real-world practice scenarios."
            ),
            'credentials': 'TESOL Certified · B.A. English Literature · Ex-Google interview coach · 500+ sessions delivered',
            'specialties': ['Job Interviews', 'Pronunciation', 'Business English', 'Accent Reduction', 'IELTS Speaking'],
            'languages': ['English', 'Hindi', 'Punjabi'],
            'hourly_rate': '45.00',
            'rating_avg': '4.90',
            'session_count': 142,
            'timezone': 'Asia/Kolkata',
            'offers_intro_call': True,
            'is_active': True,
        },
        'availability': [
            {'day_of_week': 'mon', 'start_time': '09:00', 'end_time': '13:00'},
            {'day_of_week': 'mon', 'start_time': '18:00', 'end_time': '21:00'},
            {'day_of_week': 'wed', 'start_time': '09:00', 'end_time': '13:00'},
            {'day_of_week': 'wed', 'start_time': '18:00', 'end_time': '21:00'},
            {'day_of_week': 'fri', 'start_time': '10:00', 'end_time': '14:00'},
            {'day_of_week': 'sat', 'start_time': '09:00', 'end_time': '17:00'},
        ],
        'bundles': [
            {'name': '3-Session Starter', 'session_count': 3, 'price': '120.00'},
            {'name': '6-Session Growth',  'session_count': 6, 'price': '225.00'},
            {'name': '12-Session Pro',    'session_count': 12, 'price': '420.00'},
        ],
    },
    {
        'username': 'hariom',
        'email': 'hariom@speechef.com',
        'password': 'mentor123',
        'first_name': 'Hariom',
        'last_name': 'Choudhary',
        'profile': {
            'bio': (
                "I'm Hariom, a public speaking trainer and debate coach. I've trained 300+ speakers "
                "at universities and corporates across India. My sessions focus on structuring arguments, "
                "eliminating hesitation, and projecting authority. Whether you're preparing for a pitch, "
                "a debate, or a boardroom presentation — I'll help you own the room."
            ),
            'credentials': 'M.A. Communication Studies · National Debate Champion 2019 · TED Talk coach · Toastmasters CC',
            'specialties': ['Public Speaking', 'Debate', 'Presentation Skills', 'Leadership Communication', 'Storytelling'],
            'languages': ['English', 'Hindi'],
            'hourly_rate': '38.00',
            'rating_avg': '4.80',
            'session_count': 89,
            'timezone': 'Asia/Kolkata',
            'offers_intro_call': True,
            'is_active': True,
        },
        'availability': [
            {'day_of_week': 'tue', 'start_time': '10:00', 'end_time': '14:00'},
            {'day_of_week': 'tue', 'start_time': '17:00', 'end_time': '20:00'},
            {'day_of_week': 'thu', 'start_time': '10:00', 'end_time': '14:00'},
            {'day_of_week': 'thu', 'start_time': '17:00', 'end_time': '20:00'},
            {'day_of_week': 'sat', 'start_time': '10:00', 'end_time': '15:00'},
            {'day_of_week': 'sun', 'start_time': '11:00', 'end_time': '16:00'},
        ],
        'bundles': [
            {'name': '3-Session Starter', 'session_count': 3, 'price': '99.00'},
            {'name': '5-Session Sprint',  'session_count': 5, 'price': '159.00'},
            {'name': '10-Session Master', 'session_count': 10, 'price': '299.00'},
        ],
    },
    {
        'username': 'darshika',
        'email': 'darshika@speechef.com',
        'password': 'mentor123',
        'first_name': 'Darshika',
        'last_name': 'Tiwari',
        'profile': {
            'bio': (
                "Hello! I'm Darshika, a language coach specializing in fluency, vocabulary, and the "
                "nuances of everyday English. I work with learners who want to sound natural — not "
                "just grammatically correct. My approach blends phonetics, conversational practice, "
                "and mindset coaching to remove the fear of speaking. Perfect for IELTS, TOEFL, or "
                "anyone wanting to feel at home in English."
            ),
            'credentials': 'CELTA Certified · M.A. Applied Linguistics · IELTS 8.5 · 4 years at British Council',
            'specialties': ['Fluency', 'IELTS Speaking', 'TOEFL', 'Vocabulary Building', 'Conversational English'],
            'languages': ['English', 'Hindi', 'Gujarati'],
            'hourly_rate': '42.00',
            'rating_avg': '4.95',
            'session_count': 203,
            'timezone': 'Asia/Kolkata',
            'offers_intro_call': True,
            'is_active': True,
        },
        'availability': [
            {'day_of_week': 'mon', 'start_time': '07:00', 'end_time': '11:00'},
            {'day_of_week': 'mon', 'start_time': '14:00', 'end_time': '17:00'},
            {'day_of_week': 'wed', 'start_time': '07:00', 'end_time': '11:00'},
            {'day_of_week': 'fri', 'start_time': '07:00', 'end_time': '11:00'},
            {'day_of_week': 'fri', 'start_time': '14:00', 'end_time': '17:00'},
            {'day_of_week': 'sun', 'start_time': '09:00', 'end_time': '14:00'},
        ],
        'bundles': [
            {'name': '4-Session Foundation', 'session_count': 4, 'price': '148.00'},
            {'name': '8-Session Fluency',    'session_count': 8, 'price': '280.00'},
            {'name': '15-Session Immersion', 'session_count': 15, 'price': '500.00'},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed dummy mentor profiles for gagandeep, hariom & darshika'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing mentor profiles for these users before re-seeding',
        )

    def handle(self, *args, **options):
        for data in MENTORS:
            username = data['username']
            p = data['profile']

            # Get or create the user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                },
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(f'  Created user: {username}')
            else:
                # Update name in case it changed
                user.first_name = data['first_name']
                user.last_name = data['last_name']
                user.save(update_fields=['first_name', 'last_name'])
                self.stdout.write(f'  Using existing user: {username}')

            # Delete existing mentor profile if --reset
            if options['reset']:
                MentorProfile.objects.filter(user=user).delete()

            # Get or create mentor profile
            mentor, m_created = MentorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': p['bio'],
                    'credentials': p['credentials'],
                    'specialties': p['specialties'],
                    'languages': p['languages'],
                    'hourly_rate': p['hourly_rate'],
                    'rating_avg': p['rating_avg'],
                    'session_count': p['session_count'],
                    'timezone': p['timezone'],
                    'offers_intro_call': p['offers_intro_call'],
                    'is_active': p['is_active'],
                },
            )
            if not m_created:
                # Update fields on existing profile
                for field, value in {
                    'bio': p['bio'],
                    'credentials': p['credentials'],
                    'specialties': p['specialties'],
                    'languages': p['languages'],
                    'hourly_rate': p['hourly_rate'],
                    'rating_avg': p['rating_avg'],
                    'session_count': p['session_count'],
                    'timezone': p['timezone'],
                    'offers_intro_call': p['offers_intro_call'],
                    'is_active': p['is_active'],
                }.items():
                    setattr(mentor, field, value)
                mentor.save()

            # Availability: clear and re-add
            mentor.availability.all().delete()
            for slot in data['availability']:
                MentorAvailability.objects.create(
                    mentor=mentor,
                    day_of_week=slot['day_of_week'],
                    start_time=slot['start_time'],
                    end_time=slot['end_time'],
                )

            # Bundles: add only if not already present
            for bundle_data in data['bundles']:
                MentorBundle.objects.get_or_create(
                    mentor=mentor,
                    name=bundle_data['name'],
                    defaults={
                        'session_count': bundle_data['session_count'],
                        'price': bundle_data['price'],
                        'is_active': True,
                    },
                )

            verb = 'Created' if m_created else 'Updated'
            self.stdout.write(self.style.SUCCESS(
                f'  {verb} mentor profile for @{username} '
                f'({len(data["availability"])} slots, {len(data["bundles"])} bundles)'
            ))

        self.stdout.write(self.style.SUCCESS('\nDone! 3 mentor profiles seeded.'))
