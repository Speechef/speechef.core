# FIX4.1 — Fix MentorAvailability day_of_week Type Mismatch

## Problem
`MentorAvailability.day_of_week` in the backend model uses string choices
(`"mon"`, `"tue"`, …, `"sun"`), and `MentorAvailabilitySerializer` returns
those strings verbatim.

`frontend/app/(games)/mentors/[id]/page.tsx` declares:
- `Availability.day_of_week: number`
- `selectedSlot: { day: number; time: string }`

and then:
- `DAY_NAMES[slot.day_of_week]` — array lookup with a string key → always `undefined`
- `selectedSlot!.day - now.getDay()` — arithmetic on a string → `NaN`

This causes the booking modal to show blank slot labels and calculates an
incorrect `scheduled_at` date when booking a session.

## Solution
Fix the frontend to match the backend's string representation:
1. Change `Availability.day_of_week` type to `string`.
2. Replace the `DAY_NAMES` array with two records:
   - `DAY_LABEL` (`mon → 'Monday'`, etc.) for display.
   - `DAY_JS` (`sun → 0`, `mon → 1`, …, `sat → 6`) for `Date.getDay()` arithmetic.
3. Change `selectedSlot` type to `{ day: string; time: string }`.
4. Fix date arithmetic: `DAY_JS[selectedSlot!.day] - now.getDay()`.
5. Replace `DAY_NAMES[slot.day_of_week]` with `DAY_LABEL[slot.day_of_week]`
   in both the booking modal and the availability card.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/mentors/[id]/page.tsx` | Fix Availability type, DAY_NAMES → DAY_LABEL/DAY_JS, date arithmetic |

## No Backend Changes
Backend already returns the correct string values.
