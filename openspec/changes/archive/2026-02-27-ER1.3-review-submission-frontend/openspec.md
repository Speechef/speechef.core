# ER1.3 — Expert Review Submission Frontend (/review)

## Status: Done

## Why
Users need a clear, trustworthy flow to upload a video and pay for expert review. The UI must feel premium to justify the price and match the dark-card aesthetic teased on the landing page.

## What
Build the `/review` page with a multi-step submission wizard.

### Step 1: Choose Review Type
- 4 cards: General · IELTS Speaking · Job Interview · Presentation
- Each card shows what the reviewer will focus on

### Step 2: Upload Video
- Drag-and-drop zone (video only: MP4, MOV, WebM — max 500MB)
- OR: link to a past AnalysisSession (dropdown of user's previous uploads)
- Preview thumbnail after upload

### Step 3: Choose Expert (Optional)
- Scrollable expert card list (fetched from API)
- Each card: photo, rating, specialties, languages, rate, "Auto-assign" option
- Filter by specialty and language
- Expand card to see full profile + intro video

### Step 4: Payment
- Stripe Elements embedded payment form
- Shows: review type, selected expert (or "Auto-assigned"), price
- Submit → `POST /api/v1/review/submit/` → confirms payment via Stripe.js

### Step 5: Confirmation
- "Your review has been submitted" success screen
- Shows review ID, expert name (or "Being assigned"), deadline (48h from now)
- CTA: `Track Your Review →` → `/review/<id>/status`

### Expert Panel Page (/review/experts)
- Full page browsable expert directory
- Search + filter by specialty, language, rating, price
- Each expert has a profile page `/review/experts/<id>` with full bio, intro video, past review snippets

## Files to Touch
- `frontend/app/(app)/review/page.tsx` (new — wizard)
- `frontend/app/(app)/review/[reviewId]/page.tsx` (new — status/feedback)
- `frontend/app/(app)/review/experts/page.tsx` (new)
- `frontend/app/(app)/review/experts/[id]/page.tsx` (new)
- `frontend/components/review/ReviewTypeSelector.tsx` (new)
- `frontend/components/review/ExpertPicker.tsx` (new)
- `frontend/components/review/PaymentStep.tsx` (new)
- `frontend/lib/api/review.ts` (new)

## Done When
- Full 5-step wizard completes without error
- Stripe payment goes through in test mode (use test card 4242...)
- Confirmation screen shows correct review details
- Expert directory page loads and filters work
