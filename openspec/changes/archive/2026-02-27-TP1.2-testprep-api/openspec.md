# TP1.2 — Test Prep API Endpoints

## Status: Done

## Why
The test prep frontend needs endpoints to list exams, fetch questions, submit answers, and retrieve predicted scores. Scored free-speech answers must go through the AI pipeline (I1.9).

## What

### Endpoints

`GET /api/v1/testprep/exams/`
- Returns list of active exams: id, name, slug, sections, logo URL

`GET /api/v1/testprep/exams/<slug>/`
- Exam detail with all sections and question counts

`GET /api/v1/testprep/exams/<slug>/sections/<section_slug>/questions/`
- Returns paginated questions for a section
- Optionally filtered by difficulty: `?difficulty=medium`

`POST /api/v1/testprep/attempts/start/`
- Body: `{exam_slug, section_slug (optional, omit for full mock)}`
- Creates ExamAttempt with status pending, returns `{attempt_id}`

`POST /api/v1/testprep/attempts/<id>/answer/`
- Body: `{question_id, answer}` — answer is text OR a base64/multipart audio blob for free_speech
- For free_speech: uploads audio to R2, queues AI scoring task
- For multiple_choice/fill_blank: scores immediately
- Returns `{scored: bool, ai_score: number|null}` (null if async)

`POST /api/v1/testprep/attempts/<id>/complete/`
- Marks attempt as completed, calculates predicted_score, returns results

`GET /api/v1/testprep/attempts/`
- User's attempt history with predicted scores

### Celery Task
`score_free_speech_answer(attempt_id, question_id, audio_key)` — calls I1.9 pipeline

## Files to Touch
- `backend/testprep/views.py`
- `backend/testprep/serializers.py`
- `backend/testprep/urls.py`
- `backend/testprep/tasks.py`
- `backend/speechef/api_urls.py`

## Done When
- Can start an attempt, answer all questions, complete it, and receive a predicted score
- Free speech answers are queued for AI scoring and update asynchronously
- Attempt history endpoint returns correctly shaped data for the frontend
