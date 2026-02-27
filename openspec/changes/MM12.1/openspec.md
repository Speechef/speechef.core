# MM12.1 — Mentor Profile Edit Page

## Problem
The mentor dashboard's Quick Actions panel links to `/mentors/profile/edit`,
which does not exist, resulting in a 404 for mentors trying to update their
profile.

## Solution

### Backend
Add `GET /mentors/profile/` and `PATCH /mentors/profile/` endpoints:
- `GET` — returns mentor's own profile (editable fields only)
- `PATCH` — validates and updates `bio`, `specialties`, `languages`,
  `hourly_rate`, `timezone`, `credentials`, `offers_intro_call`

Add a `MentorProfileEditSerializer` that exposes these fields.
Add the URL to `mentorship/api_urls.py`.

### Frontend
Create `frontend/app/(games)/mentors/profile/edit/page.tsx`:
- Auth-gated; redirects to `/login` if not logged in
- Fetches current profile from `GET /mentors/profile/`
- Form fields: Bio (textarea), Specialties (multi-checkbox), Languages
  (multi-checkbox), Hourly Rate ($), Timezone (text), Credentials (textarea),
  Offers Intro Call (toggle)
- Save via `PATCH /mentors/profile/` with `useMutation`
- Success toast "Profile saved ✓"; back link to dashboard

## Files Changed
| File | Change |
|------|--------|
| `backend/mentorship/serializers.py` | Add `MentorProfileEditSerializer` |
| `backend/mentorship/api_views.py` | Add `mentor_profile_self` view (GET + PATCH) |
| `backend/mentorship/api_urls.py` | Add `path("profile/", ...)` |
| `frontend/app/(games)/mentors/profile/edit/page.tsx` | New page |

## No Migration Needed
All fields already exist on `MentorProfile`.
