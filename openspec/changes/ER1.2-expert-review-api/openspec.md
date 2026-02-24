# ER1.2 — Expert Review API

## Status: Blocked → ER1.1

## Why
The `/review` frontend needs endpoints to submit a review request, pay, track status, and retrieve delivered feedback.

## What

### Endpoints

`GET /api/v1/review/experts/`
- Returns list of active experts with profile info
- Filterable by specialty and language
- Includes rating_avg, review_count, hourly_rate

`GET /api/v1/review/experts/<id>/`
- Expert profile detail including intro video URL (signed R2 URL)

`POST /api/v1/review/submit/`
- Accepts: `video` (file), `review_type`, `expert_id` (optional), `analysis_session_id` (optional)
- Validates file type (video only)
- Creates Stripe PaymentIntent, returns `{review_id, client_secret}`
- After frontend confirms payment → Stripe webhook fires `payment_intent.succeeded`

`POST /api/v1/review/webhook/` (Stripe webhook)
- On `payment_intent.succeeded`: update review `price_paid`, set status to `submitted`, trigger assignment task

`GET /api/v1/review/<review_id>/status/`
- Returns `{status, submitted_at, deadline_at, delivered_at}`

`GET /api/v1/review/<review_id>/feedback/`
- Returns feedback_notes + signed URL for feedback_video_key
- 403 if status != `delivered`

`POST /api/v1/review/<review_id>/rate/`
- User rates the review (1–5); updates Expert.rating_avg

### Celery Task
`assign_expert(review_id)` — auto-assigns the expert with fewest open reviews if none chosen

## Files to Touch
- `backend/review/views.py`
- `backend/review/serializers.py`
- `backend/review/urls.py`
- `backend/review/tasks.py`
- `backend/speechef/api_urls.py`
- `backend/requirements.txt` — add `stripe`
- `.env.example` — add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Done When
- Expert list endpoint returns correctly shaped data
- Submit endpoint creates a Stripe PaymentIntent and returns client_secret
- Stripe webhook updates review status correctly (test with Stripe CLI)
- Status and feedback endpoints return correct data per status
- Rate endpoint updates Expert.rating_avg atomically
