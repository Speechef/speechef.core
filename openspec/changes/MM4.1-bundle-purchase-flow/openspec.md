# MM4.1 — Bundle Purchase Flow

## Status: Unblocked

## Why
`MentorBundle` is defined in MM1.1 and bundles are displayed on the mentor profile page (MM1.3),
but there is no way to actually buy one. The `Apply bundle` slot in the booking modal is a dead
placeholder. Bundles are a major revenue driver — discounted multi-session packages increase
commitment and reduce churn.

## What

### Bundle Card UI (mentor profile page)
Each bundle card gets a `Buy Package →` button:
- Shows: name, session count, total price, per-session price, savings % vs individual
- Click opens a confirmation modal: "You're buying 5 sessions with [Mentor]. Total: $X"
- Confirm → creates Stripe Checkout session (not PaymentIntent — full checkout page for bundles)

### Backend

`POST /api/v1/mentors/<id>/bundles/<bundle_id>/purchase/`
- Creates a Stripe Checkout Session in `payment` mode
- Line item: bundle name, price
- Metadata: `mentor_id`, `bundle_id`, `user_id`
- Success URL: `/mentors/bundles/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/mentors/<id>` (back to profile)

Stripe webhook `checkout.session.completed`:
- Creates `UserBundle` record (see below) with `sessions_remaining = bundle.session_count`

New model:
```python
class UserBundle(models.Model):
    user = ForeignKey(User)
    bundle = ForeignKey(MentorBundle)
    mentor = ForeignKey(MentorProfile)
    sessions_remaining = IntegerField()
    stripe_checkout_session = CharField()
    purchased_at = DateTimeField(auto_now_add=True)
    expires_at = DateTimeField()   # purchased_at + 12 months
```

`GET /api/v1/mentors/bundles/my/`
- Returns user's active bundles with `sessions_remaining`, mentor info, expiry

### Success Page `/mentors/bundles/success`
- Confirms purchase
- Shows sessions remaining
- CTA: `Book Your First Session →`

## Files to Touch
- `backend/mentorship/models.py` — `UserBundle` model + migration
- `backend/mentorship/views.py` — `BundlePurchaseView`, `UserBundleListView`, webhook handler update
- `backend/mentorship/serializers.py` — `UserBundleSerializer`
- `backend/mentorship/urls.py` — new routes
- `frontend/app/(app)/mentors/[id]/page.tsx` — Buy Package button on bundle cards
- `frontend/app/(app)/mentors/bundles/success/page.tsx` (new)
- `frontend/components/mentors/BundlePurchaseModal.tsx` (new)

## Done When
- Buy Package button creates a Stripe Checkout session and redirects correctly
- Webhook confirms purchase and creates `UserBundle` with correct `sessions_remaining`
- Success page shows correct bundle details
- `GET /api/v1/mentors/bundles/my/` returns user's active bundles
- Bundle expires after 12 months (stored in `expires_at`)
