# L2.2 — Learn Hub Bookmarks

## Status: Unblocked

## Problem
Users have no way to save learn articles for later reading. There's no bookmark / save-for-later feature.

## Solution
- Add `UserBookmark` model: `user FK → User`, `post FK → Post`, `created_at`; unique_together (user, post)
- Add `POST /learn/posts/<pk>/bookmark/` toggle endpoint (creates if missing, deletes if exists; returns `{ bookmarked: bool }`)
- Add `GET /learn/bookmarks/` to list the user's bookmarked posts
- Add bookmark icon button to each post card on the learn page (filled/hollow state; requires auth — redirects to login if not)
- Add "Bookmarks" link in the learn sidebar that filters to bookmarked posts

## Acceptance Criteria
- Bookmark button appears on each post row in the learn list
- Clicking it toggles bookmark state and updates UI optimistically
- Sidebar shows "Bookmarks" filter option
- Unauthenticated users see the button but get redirected to /login on click

## Files
- `backend/learn/models.py` (add UserBookmark)
- `backend/learn/migrations/0003_userbookmark.py` (new manual migration)
- `backend/learn/serializers.py` (add UserBookmarkSerializer + add `is_bookmarked` to PostListSerializer)
- `backend/learn/api_views.py` (add bookmark_toggle, bookmarked_posts views)
- `backend/learn/api_urls.py` (add bookmark routes)
- `frontend/app/(games)/learn/page.tsx` (add bookmark buttons + Bookmarks sidebar filter)
