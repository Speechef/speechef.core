# ER1.4 — Review Status Tracker + Feedback Delivery Page

## Status: Blocked → ER1.3

## Why
After payment, users need to track their review's progress and receive feedback in a clear, dedicated page. This closes the review loop and is the moment of highest perceived value.

## What

### Status Tracker Page `/review/<id>`

**Status Timeline** (vertical stepper):
```
✅ Submitted — Feb 24, 2026 2:30 PM
✅ Assigned to Dr. Anika Sharma — Feb 24, 2026 2:35 PM
⏳ In Review — Est. delivery by Feb 26, 2026 2:30 PM
○  Delivered
```

- Polls `GET /api/v1/review/<id>/status/` every 30s
- Deadline countdown timer ("Feedback due in 18h 42m")
- Expert card shown (photo, rating, bio snippet)
- Email notification also sent when status changes (Django signal → email task)

### Feedback Delivery (when status = `delivered`)
Three-panel layout:

**Left:** Video feedback player
- Expert's recorded video (streamed from signed R2 URL)
- Playback speed controls, subtitles if available

**Center:** Written Notes
- Markdown-rendered notes from expert
- Timestamps in notes are clickable (jump to that point in video)

**Right:** Action Items
- Expert's top 3 recommendations
- Links to relevant learn articles or practice games

**Bottom:** Rating Widget
- 1–5 star rating for this review
- Optional text feedback
- Submit → `POST /api/v1/review/<id>/rate/`

### Follow-up Q&A
- Simple message thread between user and expert
- 1 follow-up Q&A included in review price
- `POST /api/v1/review/<id>/message/`

## Files to Touch
- `frontend/app/(app)/review/[reviewId]/page.tsx` — extend with feedback layout
- `frontend/components/review/StatusTimeline.tsx` (new)
- `frontend/components/review/FeedbackPlayer.tsx` (new)
- `frontend/components/review/FeedbackNotes.tsx` (new)
- `frontend/components/review/ReviewRating.tsx` (new)
- `frontend/components/review/QAThread.tsx` (new)
- `backend/review/views.py` — add message endpoint
- `backend/review/models.py` — add ReviewMessage model

## Done When
- Status page shows correct stepper state based on review status
- Countdown timer is accurate
- Delivered feedback: video plays, notes render, action items display
- Rating widget submits and updates expert rating
- Q&A thread sends and receives messages
