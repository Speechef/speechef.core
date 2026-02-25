# WL2.1 — Learn Post Prev/Next Navigation

## Summary
Add previous and next article navigation links at the bottom of a learn post detail page.

## Changes

### Frontend — `frontend/app/(games)/learn/[id]/page.tsx`
- Fetch all posts (`/learn/posts/`) and sort by `id`
- Find the post immediately before and after the current one by `id`
- Render prev/next links below the Related Articles section

## Status
Done
