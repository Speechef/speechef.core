# AN3.1 — Analysis History Source Filter

## Problem
MM3.3 introduced a `source` field on `AnalysisSession` (`upload` vs
`mentor_session`). The analysis history page has no way to filter by source,
so mentor-session scorecards are mixed in with user uploads with no
distinguishing UI.

## Solution
Add a "source" chip row below the existing status tabs:
- **All** (default) — show everything
- **Uploads** — `source === 'upload'`
- **Mentor Sessions** — `source === 'mentor_session'`

Also display a "Mentor session" badge on cards that came from a session.
The `source` field is already returned by the backend serializer (MM3.3).

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/analyze/history/page.tsx` | Add `source` to `AnalysisSession` interface; add source filter state & chips; badge on card |

## No Backend Changes
`source` is already returned by `AnalysisSessionSerializer`.
