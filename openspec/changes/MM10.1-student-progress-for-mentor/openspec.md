# MM10.1 — Student Progress View for Mentor

## Status: Unblocked

## Why
Mentors assign homework and track improvement, but they have no visibility into the student's actual
speech analysis scores. A mentor who can see a student's score history gives more targeted feedback,
sets better goals, and retains students longer because the coaching feels personalised.

## What

### Student Profile View (mentor-only)
Route: `/mentors/dashboard/students/<student_id>`
- Only accessible by a mentor who has at least one confirmed or completed session with that student

### Sections

**Score Timeline Chart**
- Line chart: last 10 analysis sessions, one line per dimension (fluency, grammar, pace, pronunciation, vocabulary)
- X-axis: session date, Y-axis: score 0–100
- Tooltip: score values + session date
- Powered by Recharts (already used in the project)

**Latest Scorecard**
- Overall score gauge
- Per-dimension bar list with delta from previous session

**Session History with This Mentor**
- List of past sessions: date, duration, homework posted (yes/no), student rating given
- Link to each session's homework if posted

**Goal Setting (simple)**
- Mentor can add a plain-text note/goal for this student (stored on a new `MentorStudentNote` model)
- Single textarea, last note overwrites previous
- Shown at the top of this page on next visit

### New Model
```python
class MentorStudentNote(models.Model):
    mentor  = ForeignKey(MentorProfile)
    student = ForeignKey(User)
    note    = TextField()
    updated_at = DateTimeField(auto_now=True)
    # unique_together: mentor + student
```

### Backend
`GET /api/v1/mentors/students/<student_id>/progress/`
- Auth: requesting user must have a `MentorProfile` with a session involving `student_id`
- Returns: analysis sessions (scores only, not transcript for privacy), mentor sessions, current note

`PUT /api/v1/mentors/students/<student_id>/note/`
- Upserts `MentorStudentNote`

### Students List (mentor dashboard — extends MM2.1)
- Existing Recent Students section becomes a full Students tab with search
- Each row has a `View Progress →` link

## Files to Touch
- `backend/mentorship/models.py` — `MentorStudentNote` model + migration
- `backend/mentorship/views.py` — `StudentProgressView`, `StudentNoteView`
- `backend/mentorship/serializers.py` — `StudentProgressSerializer`
- `backend/mentorship/urls.py` — new routes
- `frontend/app/(app)/mentors/dashboard/students/[id]/page.tsx` (new)
- `frontend/components/mentors/dashboard/ScoreTimeline.tsx` (new)
- `frontend/components/mentors/dashboard/StudentSessions.tsx` (new)
- `frontend/components/mentors/dashboard/StudentNoteEditor.tsx` (new)
- `frontend/app/(app)/mentors/dashboard/page.tsx` — Students tab with search + View Progress links

## Done When
- Mentor can navigate to a student's progress page from their dashboard
- Score timeline chart shows real analysis data for sessions linked to that student
- Mentor can save a note/goal for the student and it persists across sessions
- A mentor cannot access a student's progress if they have no shared session (403)
- Student's full transcript is never exposed — only numeric scores and dimension names
