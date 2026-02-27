# MM2.2 — Homework Delivery UI (Mentor Side)

## Status: Blocked → MM2.1

## Why
`MentorSession.homework` exists in the model and the student-side rendering is in MM1.3, but mentors
have no interface to actually write and post homework. The feature is invisible to mentors today.
High retention impact — homework is the main reason students rebook.

## What

### Mentor Dashboard — Session Cards (extends MM2.1)
Add a `Post Homework` action to completed session cards on the mentor dashboard:
- Visible when `status=completed` and `homework` is blank
- Button opens an inline textarea (markdown supported)
- Submit calls `POST /api/v1/mentors/sessions/<id>/homework/` (already exists in MM1.2)
- After posting: card shows homework preview with an Edit button
- Sends email notification to student (already wired in MM1.2 tasks.py)

### Homework History Tab on Dashboard
New tab on `/mentors/dashboard`: **Homework**
- Lists all completed sessions grouped by student
- Shows posted homework with date, or "No homework posted yet" with a `Post Now →` prompt
- Quick-edit in place (PATCH to same endpoint)

### Markdown Preview
- Textarea with live markdown preview toggle (split view on desktop, tab toggle on mobile)
- Toolbar: bold, italic, bullet list, numbered list, code block
- Character limit: 2000

## Files to Touch
- `frontend/components/mentors/dashboard/HomeworkEditor.tsx` (new)
- `frontend/components/mentors/dashboard/HomeworkTab.tsx` (new)
- `frontend/app/(app)/mentors/dashboard/page.tsx` — add Homework tab
- `backend/mentorship/views.py` — `HomeworkView` already exists, add PATCH support
- `backend/mentorship/serializers.py` — add `homework` to session detail serializer

## Done When
- Mentor can open a completed session card and post homework text
- Markdown renders correctly in the preview
- After posting, student receives email notification
- Posted homework appears on student's past session card (MM1.3 existing UI)
- Mentor can edit previously posted homework
