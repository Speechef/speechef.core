# SC1.1 — Shareable Analysis Scorecard Page

## Status: Unblocked

## Problem
Analysis results are private (auth-gated). Users have no way to share their Speechef score with employers or on social media.

## Solution
- Backend: Add `GET /analysis/<pk>/share/` — AllowAny endpoint, returns a public summary: overall_score, fluency_score, vocabulary_score, tone, narrative_feedback, username, created_at. Only works for sessions with status='done'.
- Frontend: `/share/[id]/page.tsx` — public scorecard with score arc, subscores, tone, a "Powered by Speechef" footer, and a "Copy link" button.

## Files
- `backend/analysis/api_views.py` (add share_scorecard view)
- `backend/analysis/api_urls.py` (add <pk>/share/ route)
- `frontend/app/(public)/share/[id]/page.tsx` (new public page)
