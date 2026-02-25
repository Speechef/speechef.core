# G5.1 — Game Session History Page

## Status: Unblocked

## Problem
The dashboard shows only the 5 most recent sessions and no way to browse full game history. Users cannot filter by game type or see their progress over time.

## Solution
Create `/practice/history` page calling `GET /practice/sessions/` with a game-type filter dropdown. Show all sessions in a table (game, score, date) sorted newest first. Add pagination via the backend (extend sessions endpoint to accept `?game=` and `?limit=` params).

Backend: update `sessions` view to accept `?game=` filter.
Frontend: `/practice/history/page.tsx` with filter tabs and full session table.

## Files
- `backend/practice/api_views.py` (add ?game= filter to sessions view)
- `frontend/app/(games)/practice/history/page.tsx` (new)
- `frontend/app/(games)/practice/page.tsx` (add "History" link)
