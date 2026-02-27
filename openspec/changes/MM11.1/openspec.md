# MM11.1 — Recording Buttons on Mentor Dashboard

## Problem
The mentor dashboard's homework tab shows `recent_completed` sessions, but
`MentorDashboardSessionSerializer` does not expose `recording_key`, so mentors
cannot watch recordings of their own sessions from the dashboard.

## Solution
1. Add `recording_key` to `MentorDashboardSessionSerializer.Meta.fields`.
2. Add `recording_key` to the `DashboardSession` interface in the frontend.
3. In `HomeworkRow`, show a "Watch Recording →" button when
   `session.recording_key` is set. The button fetches the signed URL via
   `GET /mentors/sessions/<id>/recording/` and opens it in a new tab.

## Files Changed
| File | Change |
|------|--------|
| `backend/mentorship/serializers.py` | Add `recording_key` to `MentorDashboardSessionSerializer.Meta.fields` |
| `frontend/app/(games)/mentors/dashboard/page.tsx` | Add `recording_key` to `DashboardSession`; `RecordingButton` in `HomeworkRow` |

## No Migration Needed
`recording_key` is already a column on `MentorSession`; just adding it to the
serializer output.
