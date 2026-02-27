# MM15.1 — Add review_count to Mentor Serializers

## Problem
`frontend/app/(games)/mentors/page.tsx` and `mentors/[id]/page.tsx` both declare
`review_count: number` in their `Mentor`/`MentorDetail` interfaces and render it
via `StarRating`. However `MentorListSerializer` and `MentorDetailSerializer` do
not include this field, so the frontend always renders `undefined`.

## Solution
Add a `review_count` `SerializerMethodField` to both serializers that counts
`MentorSession` rows with `student_rating__isnull=False`.

## Files Changed
| File | Change |
|------|--------|
| `backend/mentorship/serializers.py` | Add `review_count` to `MentorListSerializer` and `MentorDetailSerializer` |

## No Frontend Changes, No Migration
Field is computed at query time from existing data.
