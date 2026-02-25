# G7.1 — Dashboard 7-Day Activity Calendar Strip

## Status: Unblocked

## Problem
The dashboard streak visualization shows circles based on the raw streak count, not real calendar data. Users can't see which specific days they were active.

## Solution
Replace the raw StreakCircles with a CalendarStrip that shows the last 7 days (Mon–Sun labels) and highlights days on which the user played at least one game. Derive active days from `GET /practice/sessions/?limit=30`.

## Files
- `frontend/app/(app)/dashboard/page.tsx` (modified)
