# J3.1 — Jobs "For You" Filter Tab

## Status: Unblocked

## Problem
Users with a Speechef score have no quick way to see only the jobs they qualify for. They must manually scan each job's score requirement.

## Solution
Add a "For You ✓" filter tab (only shown when user is logged in and has a score) on the Jobs page that client-side filters jobs to those where `!min_speechef_score || userScore >= min_speechef_score`. Show a match count badge on the tab.

## Files
- `frontend/app/(games)/jobs/page.tsx` (modified)
