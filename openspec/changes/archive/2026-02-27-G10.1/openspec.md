# G10.1 — Game History Sort

## Summary
Add a sort dropdown to the Game History page so users can sort by newest, highest score, or lowest score.

## Changes

### Frontend — `frontend/app/(games)/practice/history/page.tsx`
- Add `sortBy` state: `'newest' | 'score_desc' | 'score_asc'`
- Sort dropdown next to the game filter tabs
- Client-side sort on the fetched sessions

## Status
Done
