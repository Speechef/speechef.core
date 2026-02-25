# UG1.1 — Enhanced Profile Page

## Status: Unblocked

## Summary
Expand the minimal profile page (currently just username + email) into a full user dashboard that shows analysis score history, a mini score trend, recent expert reviews, and recent mentor sessions.

## Scope

### Frontend only (no new backend needed)
- Fetch data from existing APIs: `/analysis/sessions/`, `/review/my/`, `/mentors/sessions/my/`

### Profile page sections
1. **Account** — existing username/email form (keep)
2. **Score History** — last 5 completed analysis sessions with scores, mini SVG trend line
3. **Recent Reviews** — last 3 expert reviews with status badges + links to /review/<id>
4. **Recent Sessions** — last 3 mentor sessions with status + mentor name

## Files
- `frontend/app/(app)/profile/page.tsx` — rewrite to multi-section layout
