# FIX15.1 — Fix day_of_week Type Bug in Mentor Sessions Rescheduling Modal

## Problem
`frontend/app/(games)/mentors/sessions/page.tsx` contains the same
`day_of_week` type mismatch that FIX4.1 fixed in `mentors/[id]/page.tsx`:

- `AvailabilitySlot.day_of_week: number` — but the backend returns string
  codes (`"mon"`, `"tue"`, …).
- `DAY_NAMES = ['Sunday', 'Monday', ...]` — array indexed by JS day number.
- `selectedSlot: { day: number; time: string }`.
- `dayDiff = ((selectedSlot!.day - now.getDay()) + 7) % 7 || 7` — arithmetic
  on a string → `NaN`, giving a wrong rescheduled date.
- `DAY_NAMES[slot.day_of_week]` — string key into numeric array → `undefined`.

This breaks the rescheduling modal: slot labels are blank, and the
`scheduled_at` sent to the backend is an invalid date.

## Solution
Apply the same fix as FIX4.1:
- Change `AvailabilitySlot.day_of_week` to `string`.
- Replace `DAY_NAMES` array with `DAY_LABEL` and `DAY_JS` records.
- Change `selectedSlot` type to `{ day: string; time: string }`.
- Fix date arithmetic to use `DAY_JS[selectedSlot!.day]`.
- Replace `DAY_NAMES[slot.day_of_week]` with `DAY_LABEL[slot.day_of_week]`.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/mentors/sessions/page.tsx` | Fix AvailabilitySlot type, DAY_NAMES → DAY_LABEL/DAY_JS, date calc |

## No Backend Changes
Backend already returns string day codes.
