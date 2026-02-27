# FIX7.1 — Eliminate N+1 Analysis Result Fetches on Profile Page

## Problem
`frontend/app/(app)/profile/page.tsx` fetches `/analysis/sessions/` and then
fires an additional HTTP request for **each** done session (up to 8) via:
```ts
const withResults = await Promise.all(
  done.map(async (s) => {
    const r = await api.get(`/analysis/${s.id}/results/`);
    return { ...s, result: r.data };
  })
);
```

`AnalysisSessionSerializer` already returns `result` as a nested object inline
in the list response (via `result = AnalysisResultSerializer(read_only=True)`).
Every page load fires up to 9 HTTP requests when 1 is sufficient.

## Solution
Remove the `Promise.all` loop. Read `s.result` directly from the list
response — the data is already there.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(app)/profile/page.tsx` | Replace `Promise.all` fetch loop with a direct `.slice(0, 8)` on the list data |

## No Backend Changes
`AnalysisSessionSerializer` already includes the nested `result`.
