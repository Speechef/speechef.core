# MM4.2 — Apply Bundle Credits in Booking Modal

## Status: Blocked → MM4.1

## Why
Once users can buy bundles (MM4.1), the booking modal needs to let them apply a bundle credit instead
of paying per-session. Without this the bundle is useless after purchase — students would still be
charged individually.

## What

### Booking Modal Step 2 — Confirm & Pay (extends MM1.3)
If the user has an active `UserBundle` for this mentor with `sessions_remaining > 0`:
- Show "Use bundle credit" toggle at the top of Step 2
- Toggled ON (default if bundle available):
  - Price line shows: ~~$80~~ → **Free (bundle credit)**
  - Sessions remaining shown: "3 of 5 sessions remaining"
  - No Stripe Elements payment form shown
  - Confirm button → `POST /api/v1/mentors/<id>/book/` with `bundle_id` in body
- Toggled OFF:
  - Normal Stripe payment form shown

### Backend — booking endpoint update
`POST /api/v1/mentors/<id>/book/` — update existing view:
- If `bundle_id` provided in body:
  - Validate `UserBundle` belongs to user + has `sessions_remaining > 0` + not expired + is for this mentor
  - Create `MentorSession` with `price=0` and `stripe_payment_intent=null`, `status='confirmed'`
  - Decrement `UserBundle.sessions_remaining` atomically
  - Create Daily.co room (same as regular booking)
  - Return `{session_id, meeting_url}` (no `client_secret`)

`GET /api/v1/mentors/<id>/availability/` — include `user_bundle` in response:
```json
{
  "slots": [...],
  "user_bundle": {"id": 3, "sessions_remaining": 3, "expires_at": "2027-02-01"}
}
```

## Files to Touch
- `frontend/components/mentors/BookingModal.tsx` — bundle toggle + conditional payment form
- `backend/mentorship/views.py` — update `BookSessionView` to handle bundle redemption
- `backend/mentorship/serializers.py` — update availability serializer to include `user_bundle`
- `backend/mentorship/models.py` — ensure `sessions_remaining` decrement is atomic (F expression)

## Done When
- Bundle toggle appears in booking modal when user has an active bundle for this mentor
- Booking with bundle credit creates a confirmed session without a Stripe charge
- `sessions_remaining` decrements correctly (verified via `GET /api/v1/mentors/bundles/my/`)
- Bundle with 0 sessions remaining is not shown as available
- Expired bundles are not shown
