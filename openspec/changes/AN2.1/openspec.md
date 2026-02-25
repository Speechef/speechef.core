# AN2.1 — Analysis History Status Filter Tabs

## Summary
Add filter tabs to the analysis history page so users can quickly view sessions by status (All / Done / Pending / Processing / Failed).

## Motivation
Users with many analyses have no way to filter to only completed sessions or to check pending ones. Status filter tabs enable quick navigation.

## Changes

### Frontend — `frontend/app/(games)/analyze/history/page.tsx`
- Add `filterStatus` state (`'' | 'done' | 'pending' | 'processing' | 'failed'`)
- Render filter tab pills row: All | Done | Pending | Processing | Failed
- Each tab shows a count badge from the unfiltered `sessions`
- `displayedSessions` = `filterStatus ? sessions.filter(s => s.status === filterStatus) : sessions`
- Active tab uses navy background, inactive uses gray

## Dependencies
None — client-side filter on already-fetched data.

## Status
Done
