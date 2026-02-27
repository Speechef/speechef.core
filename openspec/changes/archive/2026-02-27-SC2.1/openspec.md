# SC2.1 — Scorecard Social Share Buttons

## Summary
Add Twitter and LinkedIn share intent buttons to the shareable scorecard page.

## Changes

### Frontend — `frontend/app/(public)/share/[id]/page.tsx`
- Add "Share on X" button using `https://twitter.com/intent/tweet?text=...&url=<current-url>`
- Add "Share on LinkedIn" button using `https://www.linkedin.com/sharing/share-offsite/?url=<current-url>`
- Both open in new tab
- Tweet text includes score, grade, and Speechef mention

## Dependencies
None — no API calls needed.

## Status
Done
