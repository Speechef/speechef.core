# MM16.1 — Display Mentor Credentials on Profile Page

## Problem
`MentorDetailSerializer` includes the `credentials` field but
`frontend/app/(games)/mentors/[id]/page.tsx` never renders it.
Users browsing mentor profiles cannot see their qualifications and
certifications.

## Solution
Add a "Credentials" card section to the mentor profile page, displayed
below the "About" section and only when `mentor.credentials` is non-empty.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/mentors/[id]/page.tsx` | Add `credentials` to `MentorDetail` interface; add Credentials card after About |

## No Backend Changes
`credentials` is already serialized by `MentorDetailSerializer`.
