# LB2.1 — Leaderboard Current User Highlight

## Summary
Highlight the logged-in user's row on the leaderboard so they can instantly find their position.

## Changes

### Frontend — `frontend/app/(games)/practice/leaderboard/page.tsx`
- Import `useAuthStore` to get current username
- Also fetch `/auth/profile/` to get the username (enabled when logged in)
- Highlight the matching row with a light navy background and bold styling
- Show a "← You" label next to the user's name

## Dependencies
None — uses existing auth store and profile endpoint.

## Status
Done
