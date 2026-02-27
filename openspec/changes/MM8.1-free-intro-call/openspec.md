# MM8.1 — Free 15-Minute Intro Call

## Status: Unblocked

## Why
First-time bookings carry high friction — students are unsure if a mentor is the right fit before
committing $60–$120 for an hour. A free 15-minute intro call removes the commitment barrier and
dramatically increases first-booking conversion, which is the hardest step in the funnel.

## What

### Mentor Opt-In
Mentors toggle "Offer free intro calls" on their profile/dashboard. Stored as:
```python
# MentorProfile (existing model)
offers_intro_call = BooleanField(default=False)
```

One intro call per student–mentor pair only. Backend enforces: if `MentorSession` already exists
between this pair (any status), intro call is not available.

### Mentor Profile Page UI
If `offers_intro_call=True` and student has not had a session with this mentor:
- Show a `Book Free Intro (15 min) →` button below the regular `Book a Session →` button
- Labelled: "No payment required · One-time only"

### Booking Flow — Intro Call Path
Reuses the same booking modal, with:
- Duration locked to 15 min (no duration selector)
- Step 2 shows price as **Free** — no Stripe Elements
- On confirm: `POST /api/v1/mentors/<id>/book/` with `{is_intro: true}`
  - Creates `MentorSession` with `price=0`, `duration_minutes=15`, `status='confirmed'`, `stripe_payment_intent=null`
  - Creates Daily.co room
  - Sends confirmation email to both parties

### My Sessions page
Intro call sessions show `Intro Call` badge instead of duration.

### Admin
`MentorProfile` admin: `offers_intro_call` checkbox.

## Files to Touch
- `backend/mentorship/models.py` — `offers_intro_call` field + migration
- `backend/mentorship/views.py` — update `BookSessionView` to handle `is_intro=True`; validate one-per-pair
- `backend/mentorship/serializers.py` — expose `offers_intro_call` and `intro_available` (per-user) on mentor detail
- `frontend/app/(app)/mentors/[id]/page.tsx` — intro call button (conditional)
- `frontend/components/mentors/BookingModal.tsx` — intro mode (locked 15 min, free step 2)
- `frontend/app/(app)/mentors/sessions/page.tsx` — Intro Call badge

## Done When
- Mentor can toggle intro call offering from their dashboard
- Intro call button appears on profile only when conditions are met (offers it + student hasn't booked before)
- Booking creates a confirmed 15-min session without any Stripe charge
- Second attempt to book an intro with the same mentor is rejected (button hidden, 400 from API if attempted directly)
- Confirmation email is sent to both parties
