# L3.1 — Per-User Learn Post Completion Tracking

## Status: Unblocked

## Problem
The `completed` field on `Post` is a global boolean — any admin can flip it but users cannot individually track which articles they've read. There is no per-user read/completion state.

## Solution
- Add `UserPostCompletion` model: `user FK → User`, `post FK → Post`, `completed_at DateTimeField`; unique_together (user, post)
- Manual migration `0004_userpostcompletion.py`
- Add `POST /learn/posts/<pk>/complete/` toggle endpoint (creates if missing, deletes if exists; returns `{ completed: bool }`)
- Update `PostListSerializer` + `PostDetailSerializer` to include `is_completed` (per-user via request context)
- Add "Mark as Complete" / "Mark Incomplete" button on the post detail page
- Update learn list to use `is_completed` for the status badge

## Files
- `backend/learn/models.py` (add UserPostCompletion)
- `backend/learn/migrations/0004_userpostcompletion.py` (new)
- `backend/learn/serializers.py` (add is_completed to list + detail serializers)
- `backend/learn/api_views.py` (add post_complete toggle view)
- `backend/learn/api_urls.py` (add complete/ route)
- `frontend/app/(games)/learn/[id]/page.tsx` (add Mark Complete button)
- `frontend/app/(games)/learn/page.tsx` (use is_completed for badge)
