# F1.3 — Frontend Learn Pages

## Status: Done

## Why
The learn section only existed as Django-rendered templates. The Next.js frontend
had no `/learn` route, leaving a gap in the SPA experience.

## What
- `/learn` — Post list with category filter sidebar
- `/learn/[id]` — Post detail with full body, comment list, comment form
- Learn API endpoints (`/api/v1/learn/`) to serve both pages

## API Endpoints Added
- `GET /api/v1/learn/posts/` — list posts, optional `?category=` filter
- `GET /api/v1/learn/posts/{id}/` — post detail including comments
- `POST /api/v1/learn/posts/{id}/comments/` — submit a comment (authenticated)
- `GET /api/v1/learn/categories/` — list all categories

## Acceptance Criteria
- [x] `/learn` page lists all posts with category chips and status badges
- [x] Category sidebar filters posts client-side via API
- [x] `/learn/[id]` renders full post body and comment thread
- [x] Authenticated users can post comments via the API
- [x] Unauthenticated users see a "Log in to comment" prompt
- [x] Back link returns to the list
