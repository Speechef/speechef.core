# PR1.1 — Public Profile Page

## Status: Unblocked

## Problem
There is no way to view another user's profile. Sharing a profile or seeing a peer's badges/score requires a public-facing page.

## Solution
- Backend: Add `GET /auth/users/<username>/` endpoint returning public profile data (username, streak, longest_streak, badges, latest Speechef score)
- Frontend: `/u/[username]/page.tsx` — shows avatar initial, username, streak, badges grid, latest score ring

## Files
- `backend/users/api_views.py` (add public_profile view)
- `backend/users/api_urls.py` (add users/<username>/ route)
- `frontend/app/(games)/u/[username]/page.tsx` (new public profile page)
