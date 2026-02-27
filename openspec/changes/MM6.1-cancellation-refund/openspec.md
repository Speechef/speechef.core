# MM6.1 — Cancellation Policy + Stripe Refund

## Status: Unblocked

## Why
The booking flow creates confirmed sessions but there is no way for students or mentors to cancel.
Without a cancellation path, disputes go unresolved and students lose money on missed sessions.
A clear policy (full refund > 24 h, 50 % < 24 h, 0 % no-show) builds marketplace trust.

## What

### Cancellation Policy
| Scenario | Refund |
|----------|--------|
| Cancelled > 24 h before session | 100% |
| Cancelled ≤ 24 h before session | 50% |
| No-show (student) | 0% |
| Mentor cancels (any time) | 100% |

### Backend

`POST /api/v1/mentors/sessions/<id>/cancel/`
- Auth: student or mentor of that session only
- Validates session is in `confirmed` status and in the future
- Calculates refund amount based on policy above
- Creates Stripe Refund via `stripe.Refund.create(payment_intent=session.stripe_payment_intent, amount=refund_amount)`
- Sets `session.status = 'cancelled'`
- Records `cancelled_by` (student/mentor) and `cancellation_reason` (free text, optional)
- Sends email to both parties with refund amount and timeline
- If bundle session (`price=0`): reinstates `UserBundle.sessions_remaining += 1` instead of Stripe refund

New fields on `MentorSession`:
```python
cancelled_by   = CharField(null=True)  # 'student' | 'mentor'
cancelled_at   = DateTimeField(null=True)
cancellation_reason = TextField(blank=True)
refund_amount  = DecimalField(null=True)
```

### Frontend — My Sessions upcoming card
- `Cancel Session` link (text, not prominent button — avoid accidental cancellation)
- Confirm modal: shows policy, calculated refund amount, and "Are you sure?"
- After confirmation: card shows `Cancelled` badge + refund note
- Hide cancel link if session is < 1 h away (too late)

### Frontend — Mentor Dashboard upcoming card (MM2.1)
- Same `Cancel Session` option — mentor cancels → 100% refund always

## Files to Touch
- `backend/mentorship/models.py` — add cancellation fields + migration
- `backend/mentorship/views.py` — `CancelSessionView`
- `backend/mentorship/tasks.py` — cancellation email task
- `backend/mentorship/serializers.py` — expose cancellation fields
- `backend/mentorship/urls.py` — new route
- `frontend/app/(app)/mentors/sessions/page.tsx` — Cancel button + modal on upcoming cards
- `frontend/components/mentors/CancelSessionModal.tsx` (new)

## Done When
- Student can cancel a session > 24 h out and receive a 100% Stripe refund
- Student can cancel ≤ 24 h out and receive a 50% refund
- Mentor cancel always refunds 100%
- Bundle session cancel reinstates the credit correctly
- Both parties receive cancellation email with correct refund amount
- Cancelled sessions show correct badge in My Sessions / Dashboard
- Session status in DB is `cancelled` after cancellation
