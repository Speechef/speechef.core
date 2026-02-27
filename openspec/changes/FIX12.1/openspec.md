# FIX12.1 — Align Job Application Status Values with Backend Model

## Problem
`JobApplication.STATUS_CHOICES` in the backend model:
```python
("applied", "Applied"),
("viewed", "Viewed"),
("shortlisted", "Shortlisted"),
("rejected", "Rejected"),
```

Both `frontend/app/(games)/jobs/applications/page.tsx` and
`frontend/app/(games)/jobs/applications/[id]/page.tsx` declare
`'withdrawn'` as a valid status — a value that **does not exist** in the
backend model and can never be returned by the API.

Both pages also **omit `'viewed'`**, so applications in `viewed` status
render with no label, no icon, and unstyled (falling through to undefined).

## Solution
- Replace `'withdrawn'` with `'viewed'` everywhere in both pages:
  - `Application` interface union type
  - `STATUS_STYLES` / `STATUS_COLORS` maps
  - `STATUS_LABELS` map
  - `STATUS_ICONS` map
  - `STATUS_TABS` filter list

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/jobs/applications/page.tsx` | Replace `withdrawn` → `viewed` in all maps and the interface |
| `frontend/app/(games)/jobs/applications/[id]/page.tsx` | Replace `withdrawn` → `viewed` in all maps and the interface |

## No Backend Changes
Backend model already has `viewed` as a valid status.
