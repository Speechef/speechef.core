# MM9.2 — Top Mentor Badge

## Status: Blocked → MM9.1

## Why
The existing badge and achievement system (AC1.1) awards badges to students. Mentors deserve
recognition too. A "Top Mentor" badge surfaced on the public profile and directory listing creates
a quality signal for students and a status incentive for mentors to maintain high ratings.

## What

### Criteria (awarded automatically by Celery beat task)
| Badge | Criteria |
|-------|----------|
| `top_mentor_rising` | ≥ 5 sessions, rating_avg ≥ 4.5 |
| `top_mentor` | ≥ 20 sessions, rating_avg ≥ 4.7 |
| `top_mentor_elite` | ≥ 50 sessions, rating_avg ≥ 4.9 |

Only the highest applicable badge is shown (elite > top > rising).

### Badge Model (extends existing Badge system from AC1.1)
Add new badge types to the `Badge.BADGE_TYPES` list:
`top_mentor_rising`, `top_mentor`, `top_mentor_elite`

Attach to the mentor's user account via the existing `UserBadge` model.

### Celery Beat Task — `evaluate_mentor_badges` (runs nightly)
```python
@shared_task
def evaluate_mentor_badges():
    for mentor in MentorProfile.objects.filter(is_active=True):
        # calculate qualifying badge tier
        # call existing award_badge(mentor.user, badge_type) utility
```

### Frontend — Mentor Profile Page
- Verified badge row below the mentor's name: `🏆 Top Mentor · ⭐ Elite` (whichever applies)
- Badge tooltip on hover: explains the criteria

### Frontend — Mentor Directory Cards
- Small badge chip on the card if mentor holds any top badge

### Mentor Dashboard (MM2.1)
- If mentor has a top badge: show congratulations banner with badge icon

## Files to Touch
- `backend/users/models.py` (Badge) — add new badge types
- `backend/mentorship/tasks.py` — `evaluate_mentor_badges` task
- `backend/speechef/celery.py` — register nightly schedule for `evaluate_mentor_badges`
- `frontend/app/(app)/mentors/[id]/page.tsx` — badge display row
- `frontend/components/mentors/MentorCard.tsx` — badge chip on listing card
- `frontend/components/mentors/dashboard/MentorBadgeBanner.tsx` (new)

## Done When
- Celery beat task runs nightly and awards the correct badge tier to qualifying mentors
- `award_badge` is idempotent (running twice doesn't create duplicate `UserBadge` rows)
- Badge renders on mentor public profile with correct icon and tier label
- Badge chip shows on directory listing card
- Mentor downgraded in ratings loses badge on next nightly run (badge revoked or re-evaluated)
