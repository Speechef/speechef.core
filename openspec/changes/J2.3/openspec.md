# J2.3 — Employer Job Posting Portal

## Status: Unblocked

## Summary
Provide a `/jobs/post` page for employers and logged-in users to post jobs to the Speechef jobs board. Backend needs a new POST endpoint for job creation.

## Backend
- Add `job_create` view: `POST /jobs/create/` — authenticated, creates a Jobs record with `posted_by=request.user`
- Add route to `jobs/api_urls.py`

## Frontend
- `frontend/app/(games)/jobs/post/page.tsx`
  - Form fields: Title, Company, Location, Remote toggle, Employment type, Salary (optional), Min. Speechef Score, Application URL, Description
  - Submit → POST to `/jobs/create/`
  - On success: redirect to `/jobs/<id>` with success toast

## Files
- `backend/jobs/api_views.py` — add `job_create` view
- `backend/jobs/serializers.py` — add `JobCreateSerializer`
- `backend/jobs/api_urls.py` — add route
- `frontend/app/(games)/jobs/post/page.tsx`
