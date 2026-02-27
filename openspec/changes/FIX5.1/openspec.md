# FIX5.1 — Fix Score Delta Always-Zero Bug in Analyze Page

## Problem
`frontend/app/(games)/analyze/page.tsx` line 431:
```ts
.filter((s) => s.status === 'done' && s.result && s.id !== sessionId)
```
`s.id` is a `number` (Django integer PK from raw API response) but `sessionId`
is `string | null` (set from the upload response via `setSessionId(res.sessionId)`
where `res.sessionId` is a string).

`number !== string` is always `true` in JavaScript, so the current session is
never excluded from `prevDone`. This means `prevDone[0]` picks the **current
session itself** as the "previous" score, giving a delta of `0` every time.

## Solution
Change the filter comparison to `String(s.id) !== sessionId` so the types
align and the current session is correctly excluded.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/analyze/page.tsx` | `s.id !== sessionId` → `String(s.id) !== sessionId` |

## No Backend Changes
