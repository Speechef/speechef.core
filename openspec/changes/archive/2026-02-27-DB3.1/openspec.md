# DB3.1 — Dashboard Roleplay Stats in Game Stats

## Summary
Add a "Role Play" tile to the Game Stats grid on the dashboard, showing total sessions and average score from the user's roleplay history.

## Changes

### Frontend — `frontend/app/(app)/dashboard/page.tsx`
- Add a `useQuery` fetching `/roleplay/my/` (roleplay sessions)
- Compute: `roleplayCount` and `roleplayAvgScore` (avg of finished sessions with scores)
- Add a "Role Play" tile to the Game Stats grid alongside the word game tiles
- Link tile to `/practice/roleplay`

## Dependencies
None — uses existing `/roleplay/my/` endpoint.

## Status
Done
