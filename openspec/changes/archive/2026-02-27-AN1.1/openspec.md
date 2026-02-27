# AN1.1 — Analysis Session History Page

## Status: Unblocked

## Problem
Users can upload a speech and view their latest result, but there's no page listing all past analysis sessions with their scores and statuses.

## Solution
Create `/analyze/history` page calling the existing `GET /analysis/sessions/` endpoint, showing each session as a card: file type icon, date, status badge, overall score (if done), and a "View Results" link.

## Files
- `frontend/app/(games)/analyze/history/page.tsx` (new)
- `frontend/app/(games)/analyze/page.tsx` (add "History" link)
