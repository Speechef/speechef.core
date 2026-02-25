# G3.2 — Daily Challenge

## Status: Unblocked

## Summary
One featured challenge per day shown at `/practice/daily-challenge`.
Backend returns a date-seeded word question. Frontend gates to once-per-day via localStorage.

## Backend
- Add `GET /practice/daily/` endpoint to practice/api_views.py
  - Seeds random with today's date string → picks a consistent question for the day
  - Returns the WordQuestion for today

## Frontend
- `/practice/daily-challenge/page.tsx`
  - Fetch today's question from `/practice/daily/`
  - If localStorage says already completed today → show result/streak section
  - Otherwise show the challenge: word + 4 options + submit
  - On submit: save localStorage key `dc_YYYY-MM-DD`, show result card
  - Bonus section: "Today's Role Play Challenge" (static mode suggestion) + "Test Prep Question of the Day" (link to test-prep)
