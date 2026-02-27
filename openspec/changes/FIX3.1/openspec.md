# FIX3.1 — Fix Mentor Listing Interface Mismatches

## Problem
`frontend/app/(games)/mentors/page.tsx` has two mismatches:

1. **`is_active: boolean`** declared in the `Mentor` interface but:
   - `MentorListSerializer` does not include `is_active` in its fields.
   - The field is never referenced in any render logic or filter on the page.
   - Runtime value is always `undefined`, making the TS type wrong.

2. **`review_count` not displayed**: After MM15.1, the backend now returns
   `review_count` in `MentorListSerializer`. The `Mentor` interface already
   declares it, but `StarRating` only renders `rating_avg` — users never see
   how many reviews back up the rating.

## Solution
- Remove `is_active` from the `Mentor` interface.
- Update `StarRating` to accept an optional `reviewCount` prop and render
  `(N reviews)` beside the numeric rating when `reviewCount > 0`.
- Pass `mentor.review_count` from `MentorCard`.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/mentors/page.tsx` | Remove `is_active`; update `StarRating`; pass `review_count` |

## No Backend Changes
`review_count` already returned since MM15.1; `is_active` not needed on listing.
