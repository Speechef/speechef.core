# FIX10.1 — Show Cover Note on Application Detail Page

## Problem
`JobApplication.cover_note` is stored in the database when a user applies
for a job (set in `backend/jobs/api_views.py:job_apply`), but:
1. `JobApplicationSerializer.Meta.fields` does not include `cover_note` —
   so the field is never returned by `GET /jobs/my-applications/`.
2. `frontend/app/(games)/jobs/applications/[id]/page.tsx` never displays
   the cover note, so users can never review what they submitted.

## Solution
- Add `cover_note` to `JobApplicationSerializer.Meta.fields`.
- Add `cover_note: string` to the `Application` interface in the detail page.
- Render a "Your Cover Note" card in the detail page when `cover_note` is
  non-empty.

## Files Changed
| File | Change |
|------|--------|
| `backend/jobs/serializers.py` | Add `cover_note` to `JobApplicationSerializer.Meta.fields` |
| `frontend/app/(games)/jobs/applications/[id]/page.tsx` | Add `cover_note` to interface; render cover note card |

## No Migration
`cover_note` field already exists on the model.
