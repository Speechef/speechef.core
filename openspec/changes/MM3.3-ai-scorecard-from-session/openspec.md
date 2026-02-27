# MM3.3 — AI Scorecard from Mentor Session Recording

## Status: Blocked → MM3.1

## Why
The AI analysis pipeline (AI1.1–AI1.4) already transcribes audio and generates a communication
scorecard. Mentor sessions are recorded — feeding them through the same pipeline gives students an
objective progress measurement for every session, creating a powerful feedback loop between coaching
and self-analysis.

## What

### Trigger
After `fetch_and_store_recording` (MM3.1) completes successfully, chain a new Celery task:
`analyse_mentor_session_recording.delay(session_id)`

### Celery Task: `analyse_mentor_session_recording`
1. Fetch the R2 recording key from `MentorSession`
2. Download the MP4 from R2
3. Extract audio (ffmpeg, same pipeline as AI1.1)
4. Run through Whisper transcription → GPT-4 scoring (existing `analyse_speech` utility)
5. Create an `AnalysisSession` linked to the student user with `source='mentor_session'` and `mentor_session_id` FK
6. Send notification to student: "Your session scorecard is ready"

### New Field
```python
# AnalysisSession model (existing)
source = CharField(choices=['upload', 'mentor_session'], default='upload')
mentor_session = ForeignKey(MentorSession, null=True, blank=True)
```

### Frontend — My Sessions past card
- Add `View Scorecard →` link that navigates to `/analyze/<analysis_session_id>`
- Shows "Generating scorecard…" spinner while Celery task is in progress
- Status polled via existing `GET /api/v1/analyze/<id>/` endpoint

### Analysis History Page
- Add `source` filter chip: "All · Uploads · Mentor Sessions"
- Mentor session analyses are labelled with the mentor's name

## Files to Touch
- `backend/mentorship/tasks.py` — `analyse_mentor_session_recording` task
- `backend/analysis/models.py` — add `source` and `mentor_session` fields + migration
- `backend/analysis/serializers.py` — expose new fields
- `frontend/app/(app)/mentors/sessions/page.tsx` — View Scorecard link + spinner
- `frontend/app/(app)/analyze/history/page.tsx` — source filter chip
- `backend/mentorship/views.py` — expose `analysis_session_id` on session detail endpoint

## Done When
- Analysis is automatically triggered after every completed mentor session recording
- Student sees `View Scorecard →` on the past session card once analysis is done
- Scorecard page shows correct scores sourced from the mentor session audio
- Analysis history page correctly labels mentor-session entries
- No analysis is attempted if `recording_key` is null (graceful skip)
