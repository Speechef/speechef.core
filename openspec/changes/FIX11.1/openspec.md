# FIX11.1 — Fix Profile Score History Links to Wrong URL

## Problem
`frontend/app/(app)/profile/page.tsx` line 273:
```tsx
<Link key={s.id} href="/analyze" ...>
```
Every row in the Score History section links to `/analyze` — the fresh upload
page. Clicking any past session discards context and starts a new analysis
instead of showing that session's result.

`analyze/page.tsx` already supports loading a prior session via
`?session=<id>` (lines 276–283).

## Solution
Change `href="/analyze"` to `href={/analyze?session=${s.id}}` so each row
opens the correct prior result.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(app)/profile/page.tsx` | Fix `href="/analyze"` → `` href={`/analyze?session=${s.id}`} `` |

## No Backend Changes
