# J2.2 — Jobs Board Frontend (/jobs)

## Status: Blocked → J2.1

## Why
The jobs page needs to surface the score-match feature prominently — this is what makes Speechef's job board unique versus LinkedIn or Indeed. Candidates should instantly see if they qualify for a role.

## What

### Jobs List Page `/jobs`

**Candidate view (logged-in):**
- Filter bar: Role · Industry · Language · Remote/Onsite · Min score required
- Job cards showing:
  - Company logo, job title, location/remote badge, employment type
  - Required Speechef score (if set)
  - **Score match badge:** `✅ You qualify (82 ≥ 78)` or `⚠️ 6 points away (72 < 78)`
  - Posted date, featured badge
- Clicking a card opens job detail drawer or navigates to `/jobs/<id>`
- Infinite scroll or pagination

**Guest view:**
- Same job list but score-match badge shows "Login to see if you qualify"
- CTA banner: "Track your scores and apply with one click →"

### Job Detail Page `/jobs/<id>`
- Full job description
- Company info + logo
- Requirements including min Speechef score
- "Apply Now" button:
  - If score qualifies → apply modal (attach Speechef profile + cover note)
  - If score doesn't qualify → "Improve your score first" with CTA to `/analyze`
  - If external URL → opens in new tab

### Post a Job `/jobs/post` (Employer)
- Auth-gated to users with `EmployerProfile`
- Multi-step form: company info → job details → score requirements → preview → publish
- Stripe payment for featured listing (optional)

### Employer Dashboard `/jobs/manage`
- List of employer's posted jobs
- Per job: views, applications count, shortlisted count
- Applicants list with their Speechef score at time of apply

## API Endpoints Needed
`GET /api/v1/jobs/` — job list (filterable, paginated)
`GET /api/v1/jobs/<id>/` — job detail
`POST /api/v1/jobs/` — create job (employer only)
`POST /api/v1/jobs/<id>/apply/` — submit application
`GET /api/v1/jobs/applications/` — user's applications
`GET /api/v1/jobs/manage/` — employer's jobs + applicant data

## Files to Touch
- `frontend/app/(app)/jobs/page.tsx`
- `frontend/app/(app)/jobs/[id]/page.tsx` (new)
- `frontend/app/(app)/jobs/post/page.tsx` (new)
- `frontend/app/(app)/jobs/manage/page.tsx` (new)
- `frontend/components/jobs/JobCard.tsx` (update — add score match)
- `frontend/components/jobs/ScoreMatchBadge.tsx` (new)
- `frontend/components/jobs/ApplyModal.tsx` (new)
- `frontend/lib/api/jobs.ts` (new)
- `backend/jobs/views.py` — add all API views
- `backend/jobs/serializers.py`
- `backend/jobs/urls.py`

## Done When
- Job list shows real jobs with score-match indicators for logged-in users
- Apply flow works end-to-end (application saved in DB)
- Employer can post a job and see their applications
- Guest sees job list with login prompt on score-match badge
