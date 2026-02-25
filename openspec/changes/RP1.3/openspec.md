# RP1.3 — Role Play Session Detail Page

## Status: Unblocked

## Problem
The role play hub lists past sessions with just a score badge, but there is no way to review the full turn-by-turn conversation, the AI feedback, or the improvement tips from a past session.

## Solution
- Add `GET /roleplay/<pk>/` detail endpoint (already exists; session_detail view) — returns turns, score, ai_feedback, tips
- Create `/practice/roleplay/session/[id]/page.tsx` showing:
  - Session mode + topic header
  - Full conversation replay (user right, AI left)
  - Score arc + AI feedback text
  - Tips list
- Link each session card on the roleplay hub to this detail page

## Files
- `frontend/app/(games)/practice/roleplay/session/[id]/page.tsx` (new)
- `frontend/app/(games)/practice/roleplay/page.tsx` (add link to session detail)
