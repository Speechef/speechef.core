# MM7.1 — Mentor Availability Overrides (Date Blocks)

## Status: Unblocked

## Why
`MentorAvailability` is weekly-recurring. There is no way for a mentor to mark specific dates as
unavailable (holidays, illness, conferences). Students can book on dates the mentor has already
blocked in their head, leading to no-shows and refunds. This is a basic marketplace reliability
requirement.

## What

### New Model
```python
class MentorUnavailability(models.Model):
    mentor     = ForeignKey(MentorProfile)
    start_date = DateField()
    end_date   = DateField()      # inclusive; same as start_date for single-day blocks
    reason     = CharField(blank=True)  # internal only, not shown to students
```

### Availability Endpoint Update
`GET /api/v1/mentors/<id>/availability/?date=2026-03-15`
- Before generating slots, check if the date falls within any `MentorUnavailability` range
- If blocked: return `{"slots": [], "blocked": true}` — calendar shows "Unavailable" for that date

### Mentor Dashboard — Availability Settings Page
Route: `/mentors/dashboard/availability`

Two sections:

**Weekly Schedule**
- Table: Mon–Sun, each day shows start/end time or "Off"
- Edit button per day → time picker modal → PATCH to existing `MentorAvailability` endpoint

**Date Overrides**
- List of upcoming blocked date ranges with delete button
- "Block dates" button → date range picker modal
  - Pick start date, end date (or single day), optional reason
  - Submit → `POST /api/v1/mentors/unavailability/`

### Backend

`GET /api/v1/mentors/unavailability/` — list mentor's own blocks (authenticated mentor only)
`POST /api/v1/mentors/unavailability/` — create a block
`DELETE /api/v1/mentors/unavailability/<id>/` — remove a block

Validation: cannot block a date that already has a `confirmed` session (return 409 with list of conflicting sessions).

## Files to Touch
- `backend/mentorship/models.py` — `MentorUnavailability` model + migration
- `backend/mentorship/views.py` — `UnavailabilityView` (list/create/delete), update `AvailabilityView`
- `backend/mentorship/serializers.py` — `UnavailabilitySerializer`
- `backend/mentorship/urls.py` — new routes
- `frontend/app/(app)/mentors/dashboard/availability/page.tsx` (new)
- `frontend/components/mentors/dashboard/WeeklyScheduleEditor.tsx` (new)
- `frontend/components/mentors/dashboard/DateOverrideManager.tsx` (new)
- `frontend/components/mentors/AvailabilityCalendar.tsx` — respect blocked dates from availability response

## Done When
- Mentor can create a date range block via the dashboard
- Blocked dates show "Unavailable" in the student-facing booking calendar
- Creating a block on a date with an existing confirmed session returns a 409 with the conflicting session listed
- Mentor can delete a block and the date becomes available again
- Weekly schedule editor allows changing hours per day
