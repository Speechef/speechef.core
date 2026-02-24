# AI1.4 — Scorecard Widget + Shareable Card

## Status: Blocked → AI1.3

## Why
The scorecard is the product's social currency. When users share their score on LinkedIn or WhatsApp, it drives organic growth. The widget also needs to appear on the dashboard to show latest analysis at a glance.

## What

### Dashboard Scorecard Widget
A compact widget for the `/dashboard` page showing the user's latest analysis:
- Overall score (gauge)
- Top 3 skill scores (horizontal bars)
- Date of last analysis
- Delta from previous session (+/- badge)
- CTA: `View Full Results →` + `Analyze Again →`

### Shareable Card Generator
A server-side image rendered using `@vercel/og` (or `satori`) that produces a 1200×630 OG image:

```
┌────────────────────────────────────────┐
│  🎤 Speechef Communication Score      │
│                                        │
│  Jane Doe              Score: 82/100   │
│  ████████░░  Fluency:   88             │
│  ██████░░░░  Grammar:   71             │
│  ███████░░░  Pace:      79             │
│                                        │
│  Analyzed: Feb 24, 2026                │
│  speechef.com                          │
└────────────────────────────────────────┘
```

Accessible at: `GET /api/og/scorecard/<session_id>` → returns PNG

### Share Flow (frontend)
- `Share →` button on results page
- Options: Copy link · Download PNG · Share to LinkedIn · Share to WhatsApp
- Copy link → copies `speechef.com/results/<session_id>` (public results view)

### Public Results View
- `GET /analyze/<session_id>/public` — shows scorecard for any visitor (no auth)
- Shows overall score + radar chart + narrative feedback only (no transcript for privacy)

## Files to Touch
- `frontend/components/dashboard/ScorecardWidget.tsx` (new)
- `frontend/app/(app)/dashboard/page.tsx` — add widget
- `frontend/app/api/og/scorecard/[sessionId]/route.ts` (new — OG image)
- `frontend/app/(public)/results/[sessionId]/page.tsx` (new — public results view)
- `frontend/components/analyze/ShareButton.tsx` (new)

## Done When
- Dashboard shows scorecard widget with real data from latest analysis
- Share button opens share sheet with all options
- OG image endpoint returns a valid PNG matching the design spec
- Public results URL is viewable without login and shows correct data
