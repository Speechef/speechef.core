# J7.1 — My Applications Status Filter Tabs

## Summary
Add status filter tabs to the My Applications page so users can quickly view applications by status.

## Changes

### Frontend — `frontend/app/(games)/jobs/applications/page.tsx`
- Add `filterStatus` state
- Render filter tabs: All | Applied | Shortlisted | Rejected | Withdrawn (with counts)
- Client-side filter on already-fetched applications

## Status
Done
