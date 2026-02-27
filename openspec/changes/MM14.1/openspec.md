# MM14.1 — Mentor Intro Video Playback

## Problem
`MentorProfile.intro_video_key` is stored in the DB and included in
`MentorDetailSerializer` but is never displayed in the frontend. Mentors have
no way to showcase an intro video on their public profile.

## Solution

### Backend
Add `GET /mentors/<pk>/intro-video/` endpoint:
- Returns a signed/playable URL for the intro video key
- Mirrors the same pattern as `session_recording` (MM3.2)
- For now returns a stub URL; will be replaced with real R2 presigned URL
  once the storage pipeline is live

### Frontend
1. `mentors/[id]/page.tsx` — add `intro_video_key` to `MentorDetail` interface;
   show a "Watch Intro Video →" button below the mentor's avatar if key is set
   (same `RecordingButton` pattern: fetch URL → open new tab; handle 404)
2. `mentors/profile/edit/page.tsx` — add an "Intro Video Key" text input so
   mentors can set/update the key value directly

## Files Changed
| File | Change |
|------|--------|
| `backend/mentorship/api_views.py` | Add `mentor_intro_video` view |
| `backend/mentorship/api_urls.py` | Add `path("<int:pk>/intro-video/", ...)` |
| `backend/mentorship/serializers.py` | Add `intro_video_key` to `MentorProfileEditSerializer` |
| `frontend/app/(games)/mentors/[id]/page.tsx` | Add `intro_video_key` to interface + intro video button |
| `frontend/app/(games)/mentors/profile/edit/page.tsx` | Add intro video key field |
