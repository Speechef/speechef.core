# MM9.1 — Mentor Response to Student Reviews

## Status: Unblocked

## Why
Mentors currently have no voice on their own profile. A mentor's thoughtful response to a review
signals professionalism and gives prospective students more signal. It also increases mentor
engagement with the platform.

## What

### Data Model
```python
# MentorSession (existing)
mentor_reply       = TextField(blank=True)
mentor_replied_at  = DateTimeField(null=True)
```

### Backend
`POST /api/v1/mentors/sessions/<id>/reply/`
- Auth: mentor of that session only
- Validates: `student_review` is not blank (can only reply if a review exists)
- Validates: `mentor_reply` is blank (one reply only — no edits after posting)
- Saves `mentor_reply` + `mentor_replied_at`
- Character limit: 500

### Mentor Dashboard — Reviews Tab (extends MM2.1)
New **Reviews** tab on `/mentors/dashboard`:
- Lists all sessions where `student_rating` is set, ordered newest first
- Each row: student name, star rating, review text, date
- If `mentor_reply` is blank: inline textarea + `Post Reply` button
- If `mentor_reply` exists: shows reply in a quoted block with date

### Mentor Profile Page — Public Reviews Section (extends MM1.3)
Under each student review that has a mentor reply:
```
★★★★☆  "Great session, very helpful feedback."
        — Jane D. · Feb 2026

  └─ Mentor replied:
     "Thank you Jane! Looking forward to our next session."
     — Feb 2026
```

## Files to Touch
- `backend/mentorship/models.py` — `mentor_reply`, `mentor_replied_at` fields + migration
- `backend/mentorship/views.py` — `MentorReplyView`
- `backend/mentorship/serializers.py` — expose reply fields on session + public mentor detail
- `backend/mentorship/urls.py` — `POST /api/v1/mentors/sessions/<id>/reply/`
- `frontend/app/(app)/mentors/dashboard/page.tsx` — Reviews tab
- `frontend/components/mentors/dashboard/ReviewsTab.tsx` (new)
- `frontend/app/(app)/mentors/[id]/page.tsx` — render mentor reply under review

## Done When
- Mentor can post a reply to a review from their dashboard
- Reply is capped at 500 characters (frontend + backend)
- Attempting to reply twice returns a 400 error
- Mentor reply renders correctly on the public profile page under the relevant review
- Reviews tab shows all rated sessions with a clear "Reply" / "Replied" state
