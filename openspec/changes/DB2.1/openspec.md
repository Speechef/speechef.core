# DB2.1 — Dashboard "Personal Best" Highlight

## Status: Unblocked

## Problem
The dashboard shows aggregate stats (total games, total score, streak) but has no single highlighted stat celebrating the user's best individual performance.

## Solution
Add a "Personal Best" card in the right sidebar (below Quick Links). Shows the highest single-game score ever recorded, the game it was in, and the date. Derived from the already-fetched `sessions` array — no new API call.

## Files
- `frontend/app/(app)/dashboard/page.tsx` (modified)
