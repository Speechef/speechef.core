# MM6.2 — Student Rescheduling Flow

## Status: Blocked → MM6.1

## Why
Cancellation (MM6.1) lets students get a refund, but many just want to move a session, not cancel it.
A reschedule option reduces revenue lost to cancellations and is a much better user experience.

## What

### Rules
- Only available if the session is > 24 h away
- Student can reschedule once per session for free
- Second reschedule requires mentor's approval (out of scope for this proposal — show message)
- Rescheduling within 24 h follows the cancellation policy (disallow or show warning)

### Flow
On the My Sessions upcoming card:
1. `Reschedule` link (next to Cancel)
2. Opens the booking availability calendar (same `AvailabilityCalendar` component from MM1.3) for the same mentor
3. Student picks a new date + time slot
4. Confirmation modal: "Move session from [old time] to [new time]? No additional charge."
5. On confirm:
   - `POST /api/v1/mentors/sessions/<id>/reschedule/` with `{new_scheduled_at}`
   - Backend: updates `MentorSession.scheduled_at`, creates new Daily.co room, invalidates old room
   - Sends email to both student and mentor with new time
   - Sets `rescheduled_count += 1` on the session

New field on `MentorSession`:
```python
rescheduled_count = IntegerField(default=0)
```

### Backend

`POST /api/v1/mentors/sessions/<id>/reschedule/`
- Validates: session is confirmed, > 24 h away, `rescheduled_count < 1`, new slot is available
- Updates `scheduled_at`
- Creates new Daily.co room (`POST /v1/rooms`), stores new `meeting_url`
- Invalidates old Daily.co room (`DELETE /v1/rooms/<old_room>`)
- Sends email notifications
- Returns updated session with new `meeting_url`

## Files to Touch
- `backend/mentorship/models.py` — `rescheduled_count` field + migration
- `backend/mentorship/views.py` — `RescheduleSessionView`
- `backend/mentorship/tasks.py` — reschedule email task
- `backend/mentorship/urls.py` — new route
- `frontend/app/(app)/mentors/sessions/page.tsx` — Reschedule link + flow
- `frontend/components/mentors/RescheduleModal.tsx` (new — reuses `AvailabilityCalendar`)

## Done When
- Reschedule link appears on upcoming session cards that are > 24 h away and `rescheduled_count == 0`
- Availability calendar shows correct open slots for the mentor on the new date
- Session `scheduled_at` is updated correctly in the DB
- New Daily.co room URL is returned and displayed to user
- Both parties receive reschedule email with old and new times
- Second reschedule attempt shows "Please contact your mentor to reschedule again"
