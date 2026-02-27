# MM3.1 — Session Recording Upload to R2

## Status: Unblocked

## Why
`MentorSession.recording_key` exists in the model but is never populated. Daily.co generates a
recording after sessions end, but nothing fetches it and stores it in R2. Without this, the recording
playback (MM3.2) and AI analysis (MM3.3) features cannot exist.

## What

### Flow
1. Daily.co webhook fires `recording.ready` after a session ends and recording is processed
2. Celery task downloads the recording MP4 from the Daily.co signed URL
3. Uploads it to Cloudflare R2 under key `recordings/mentor/<session_id>/<filename>.mp4`
4. Sets `MentorSession.recording_key` to the R2 object key
5. Sets `MentorSession.status = 'completed'` if not already

### Daily.co Webhook
`POST /api/v1/mentors/daily-webhook/`
- Verify webhook signature using `DAILY_WEBHOOK_HMAC_SECRET`
- Handle event types: `recording.ready`, `meeting.ended`
- On `recording.ready`: enqueue Celery task `fetch_and_store_recording.delay(session_id, recording_url)`

### Celery Task: `fetch_and_store_recording`
```python
@shared_task(bind=True, max_retries=3)
def fetch_and_store_recording(self, session_id, recording_url):
    # download MP4 from recording_url (Daily.co signed URL, valid 1h)
    # upload to R2 via boto3
    # update MentorSession.recording_key
```

### Signed URL for Playback
`GET /api/v1/mentors/sessions/<id>/recording/`
- Returns a 1-hour pre-signed R2 URL for the recording
- Only accessible by the student or the mentor of that session

## Files to Touch
- `backend/mentorship/views.py` — `DailyWebhookView`, `SessionRecordingView`
- `backend/mentorship/tasks.py` — `fetch_and_store_recording` task
- `backend/mentorship/urls.py` — two new routes
- `backend/speechef/settings/base.py` — `DAILY_WEBHOOK_HMAC_SECRET` env var
- `.env.example` — `DAILY_WEBHOOK_HMAC_SECRET`

## Done When
- Daily.co `recording.ready` webhook is received and verified
- Celery task downloads and uploads recording to R2 within 5 minutes of session end
- `MentorSession.recording_key` is set correctly
- Signed URL endpoint returns a working playback URL for the session owner/student only
- Task retries correctly on transient network failure (max 3 attempts)
