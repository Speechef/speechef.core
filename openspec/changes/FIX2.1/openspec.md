# FIX2.1 — Fix profile/page.tsx mentor.name regression

## Problem
Phase 41 (MM3.2) changed `MentorSessionSerializer` to return the mentor as a
nested object `mentor: { id, name }` instead of a flat `mentor_name: string`.
`frontend/app/(app)/profile/page.tsx` still references `s.mentor_name`, causing
mentor sessions to render as `undefined` on the profile page.

## Solution
Update `profile/page.tsx`:
- Change `MentorSession.mentor_name: string` → `MentorSession.mentor: { id: number; name: string }`
- Replace `{s.mentor_name}` → `{s.mentor.name}`

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(app)/profile/page.tsx` | Fix `MentorSession` interface + render |

## No Backend Changes
The backend already returns the correct shape.
