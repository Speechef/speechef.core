# I1.8 — Celery Media Processing Pipeline

## Status: Done

## Why
AI analysis of audio/video is not instant — it can take 30–120 seconds depending on file length. Processing must happen asynchronously via Celery so the web request returns immediately, and the user is notified when results are ready. Celery is already in the stack (I1.6), so this is about wiring it for media tasks specifically.

## What
Set up the Celery task pipeline for audio/video analysis jobs.

### Tasks to implement
- `process_media_upload(session_id)` — entry point, called after upload completes
  1. Download file from R2 to a temp path
  2. If video: extract audio track (FFmpeg)
  3. Pass audio file to `run_transcription(session_id, audio_path)`
  4. On success: trigger `run_ai_scoring(session_id, transcript)`
  5. On any failure: mark session as `failed`, store error message
- `run_transcription(session_id, audio_path)` — calls Whisper (I1.9)
- `run_ai_scoring(session_id, transcript)` — calls GPT-4 scoring (I1.9)

### AnalysisSession model
```python
class AnalysisSession(models.Model):
    user = ForeignKey(User)
    file_key = CharField()          # R2 object key
    file_type = CharField()         # 'audio' | 'video'
    status = CharField()            # pending | processing | done | failed
    created_at = DateTimeField()
    completed_at = DateTimeField(null=True)
    error = TextField(null=True)
```

### Infrastructure
- Install `ffmpeg-python` (Python wrapper)
- Ensure FFmpeg binary available in Docker image
- Add Celery beat schedule for cleaning up temp files older than 24h

## Files to Touch
- `backend/analysis/models.py` (new app)
- `backend/analysis/tasks.py` (new)
- `backend/analysis/apps.py` (new)
- `backend/speechef/settings/base.py` — register new app
- `docker-compose.yml` — ensure FFmpeg in web image
- `backend/requirements.txt`

## Done When
- `process_media_upload.delay(session_id)` can be called and runs without error
- FFmpeg extracts audio from a test MP4 correctly
- Session status updates from `pending` → `processing` → `done` (or `failed`) in the DB
- Admin shows AnalysisSession with correct status
