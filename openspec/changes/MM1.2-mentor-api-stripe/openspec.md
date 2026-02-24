# MM1.2 — Mentor API + Stripe Connect Integration

## Status: Blocked → MM1.1

## Why
The mentor marketplace needs a booking API that handles calendar availability, creates video meeting rooms, and routes payments to the mentor via Stripe Connect.

## What

### Endpoints

`GET /api/v1/mentors/`
- Returns paginated mentor list
- Filter: specialty, language, min_rating, max_rate, available_day
- Includes rating_avg, session_count, hourly_rate, profile_photo URL

`GET /api/v1/mentors/<id>/`
- Mentor detail: full profile, intro video signed URL, bundles, availability summary

`GET /api/v1/mentors/<id>/availability/`
- Query: `?date=2026-03-01`
- Returns available 30-min / 60-min slots for that date (based on MentorAvailability, minus booked sessions)

`POST /api/v1/mentors/<id>/book/`
- Body: `{scheduled_at, duration_minutes, bundle_id (optional)}`
- Creates MentorSession with status `pending_payment`
- Creates Stripe PaymentIntent (routed via Connect to mentor, platform fee 15%)
- Creates Daily.co video room (`POST https://api.daily.co/v1/rooms`)
- Returns `{session_id, client_secret, meeting_url}`

`POST /api/v1/mentors/webhook/` (Stripe webhook)
- On `payment_intent.succeeded` → set session status to `confirmed`
- Send confirmation email to both student and mentor (Celery task)

`GET /api/v1/mentors/sessions/`
- Student's booked sessions: upcoming + past
- For mentor (if user has MentorProfile): their sessions + homework to deliver

`POST /api/v1/mentors/sessions/<id>/rate/`
- Student rates session 1–5 + review text
- Updates MentorProfile.rating_avg atomically

`POST /api/v1/mentors/sessions/<id>/homework/`
- Mentor posts homework text for student
- Sends email notification to student

### Stripe Connect Onboarding
`GET /api/v1/mentors/onboard/` — returns Stripe Connect onboarding URL for mentor
`GET /api/v1/mentors/onboard/return/` — Stripe redirect after onboarding

## Files to Touch
- `backend/mentorship/views.py`
- `backend/mentorship/serializers.py`
- `backend/mentorship/urls.py`
- `backend/mentorship/tasks.py` — email tasks
- `backend/speechef/api_urls.py`
- `backend/requirements.txt` — stripe already included
- `.env.example` — `DAILY_API_KEY`, `STRIPE_CONNECT_CLIENT_ID`

## Done When
- Mentor list + detail endpoints return correctly shaped data
- Availability endpoint returns valid slots based on MentorAvailability
- Booking creates session + Stripe PaymentIntent + Daily.co room
- Webhook confirms session and sends emails (test with Stripe CLI)
- Rating endpoint updates mentor rating_avg correctly
- Stripe Connect onboarding URL generates and redirects correctly
