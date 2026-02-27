# MY1.1 — My Job Applications Page

## Status: Unblocked

## Problem
Users can apply to jobs but have no way to view their application history and statuses from the frontend.

## Solution
Create a `/jobs/applications` frontend page that calls the existing `GET /jobs/my-applications/` endpoint and displays each application with job title, company, status badge, score at time of apply, and applied date.

## Acceptance Criteria
- Page accessible at `/jobs/applications`
- Lists all applications with: job title, company, status badge (Applied/Shortlisted/Rejected), Speechef score at apply, applied date
- Empty state with CTA to browse jobs
- Link from Jobs page or nav

## Files
- `frontend/app/(games)/jobs/applications/page.tsx` (new)
