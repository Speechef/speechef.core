# J6.1 — Job Detail "More Jobs" Section

## Summary
Add a "More Jobs" section at the bottom of the job detail page showing up to 3 other jobs fetched from the jobs API.

## Changes

### Frontend — `frontend/app/(games)/jobs/[id]/page.tsx`
- Add a second `useQuery` fetching `/jobs/` (all jobs)
- Below the main job card, render up to 3 jobs excluding the current one
- Show company initial avatar, title, company name, remote/location, employment type
- Each links to `/jobs/<id>`

## Dependencies
None — uses existing `/jobs/` endpoint.

## Status
Done
