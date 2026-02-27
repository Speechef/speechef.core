# MM2.3 — Mentor Earnings Page

## Status: Unblocked

## Why
Mentors are paid via Stripe Connect but have no in-app view of their income. They must log into the
Stripe dashboard to see payouts. An in-app earnings page increases trust, reduces support requests,
and keeps mentors engaged with the platform.

## What

### Route: `/mentors/earnings`
Only accessible to mentors with a connected Stripe account.

### Sections

**Summary cards (top)**
- This month's earnings (gross)
- Platform fee deducted (15%)
- Net payout
- Pending Stripe balance (not yet paid out)
- All-time total earned

**Monthly chart**
- Bar chart: last 12 months, gross earnings per month
- Tooltip shows: sessions count, gross, fee, net

**Payout history table**
- Columns: Date, Amount, Status (`paid` / `pending` / `in_transit`), Stripe payout ID
- Pulls from Stripe Connect `GET /v1/payouts` via the backend proxy endpoint
- Link: `View on Stripe →` per row

**Session breakdown**
- Table: student name, date, duration, price, fee, net
- Filter by month
- Download CSV button

### Backend
New endpoint: `GET /api/v1/mentors/earnings/`
- Aggregates `MentorSession` where `status=completed`, groups by month
- Calls Stripe Connect API for payout history (`stripe.Payout.list(stripe_account=mentor.stripe_account_id)`)
- Returns combined payload: monthly totals + payout list

## Files to Touch
- `frontend/app/(app)/mentors/earnings/page.tsx` (new)
- `frontend/components/mentors/earnings/EarningsSummary.tsx` (new)
- `frontend/components/mentors/earnings/MonthlyChart.tsx` (new — uses Recharts)
- `frontend/components/mentors/earnings/PayoutTable.tsx` (new)
- `frontend/components/mentors/earnings/SessionBreakdown.tsx` (new)
- `backend/mentorship/views.py` — `MentorEarningsView`
- `backend/mentorship/urls.py` — `GET /api/v1/mentors/earnings/`

## Done When
- Page shows correct monthly totals matching Stripe payouts
- Payout history table lists real Stripe payouts with correct status
- CSV download produces a valid file with all session rows
- Mentor with no Stripe account sees a prompt to connect via onboarding flow
