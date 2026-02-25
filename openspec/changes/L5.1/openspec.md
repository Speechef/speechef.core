# L5.1 — Learn Hub "New" Badge for Recent Posts

## Status: Unblocked

## Problem
The learn hub shows all posts the same way regardless of age. New content is indistinguishable from older articles.

## Solution
Add a "New" badge (small gold pill) on post cards for articles published within the last 7 days. Uses the existing `post.created_on` field — no API changes needed. Only shown when the post is not yet completed by the user.

## Files
- `frontend/app/(games)/learn/page.tsx` (modified)
