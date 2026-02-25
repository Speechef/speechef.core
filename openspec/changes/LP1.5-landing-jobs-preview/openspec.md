# LP1.5 — Landing Page: Jobs Board Preview

## Status: Done — Completed inside LP1.1 implementation

## Why
The jobs board is a strong differentiator — no other speech platform connects learners directly to employers. Surfacing it on the landing page drives both candidate sign-ups and employer leads.

## What
A section on the landing page previewing the jobs board.

### Candidate-facing
- Headline: *"Companies want communicators. We'll get you ready — and hired."*
- 3 sample job cards (static/demo):
  - Company logo, job title, location, required Speechef score
  - Score-match indicator: "Your Score: 82 ✅ You're a match!" (for logged-in users) or score requirement only (for guests)
- Filters shown but not yet functional: Role · Industry · Language · Remote/Onsite
- CTA: `Browse All Jobs →` → `/jobs`

### Employer-facing
- Small callout card below job list
- Headline: *"Hiring communicators? Post a job free."*
- CTA: `Post a Job →` → `/jobs/post` (stub)

## Files to Touch
- `frontend/app/(public)/page.tsx` — add section
- `frontend/components/landing/JobsPreview.tsx` (new)
- `frontend/components/landing/JobCard.tsx` (new)

## Done When
- Jobs preview section renders on landing page with 3 demo job cards
- Score-match indicator shows correctly for logged-in users (fetches their score)
- Employer callout card visible below job cards
- All CTAs route to the correct pages
