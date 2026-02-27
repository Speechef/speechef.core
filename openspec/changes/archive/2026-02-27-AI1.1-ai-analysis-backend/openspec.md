# AI1.1 — AI Analysis Backend

## Status: Done

## Why
This is the core value proposition of Speechef: upload audio/video and get an AI-generated scorecard. With the media pipeline (I1.8) and AI integrations (I1.9) in place, this ties them together into a complete analysis flow.

## What
Wire the full analysis pipeline: upload → process → score → store results.

### Upload endpoint
`POST /api/v1/analysis/upload/`
- Accepts multipart form data: `file`, `file_type` (`audio`|`video`)
- Validates file size (max 1GB) and MIME type
- Uploads file to Cloudflare R2 via existing storage backend
- Creates `AnalysisSession` with status `pending`
- Fires `process_media_upload.delay(session.id)` Celery task
- Returns `{session_id, status: "pending"}`

### Status endpoint
`GET /api/v1/analysis/<session_id>/status/`
- Returns `{status, created_at, completed_at}` — polled by frontend

### Results endpoint
`GET /api/v1/analysis/<session_id>/results/`
- Returns full `AnalysisResult` serialized as JSON
- 404 if not done yet, 200 with results if done

### Session list endpoint
`GET /api/v1/analysis/sessions/`
- Returns paginated list of the authenticated user's sessions
- Used by dashboard for "Recent Analyses" feed

## Files to Touch
- `backend/analysis/views.py`
- `backend/analysis/serializers.py`
- `backend/analysis/urls.py`
- `backend/speechef/api_urls.py` — register analysis URLs

## Done When
```bash
# Upload a file
curl -X POST /api/v1/analysis/upload/ \
  -H "Authorization: Bearer <token>" \
  -F "file=@speech.mp3" -F "file_type=audio"
# → {session_id: "abc123", status: "pending"}

# Poll status
curl /api/v1/analysis/abc123/status/
# → {status: "done", completed_at: "..."}

# Fetch results
curl /api/v1/analysis/abc123/results/
# → {overall_score: 74, fluency_score: 80, ...}
```
