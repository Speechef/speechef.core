# FIX14.1 — Add cancelled_at to MentorSession Interface in Sessions Page

## Problem
`MentorSessionSerializer.fields` includes `"cancelled_at"` but the
`MentorSession` TypeScript interface in
`frontend/app/(games)/mentors/sessions/page.tsx` does not declare it.

The field is returned by the API on every session object, but TypeScript
treats it as non-existent. Any future code referencing `s.cancelled_at`
would return `undefined` silently rather than being caught at compile time.

## Solution
Add `cancelled_at: string | null` to the `MentorSession` interface.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/mentors/sessions/page.tsx` | Add `cancelled_at: string | null` to `MentorSession` interface |

## No Backend Changes
Field already returned by `MentorSessionSerializer`.
