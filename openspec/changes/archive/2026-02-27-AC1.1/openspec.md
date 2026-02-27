# AC1.1 — Achievements & Badges

## Status: Unblocked

## Summary
Award badges for milestones (first analysis, streak, high scores, etc.).
Display on profile page. Create notification when a badge is earned.

## Backend (users app)
New models:
```python
class Badge(models.Model):
    BADGE_TYPES = [first_analysis, first_review, first_roleplay, first_mentor,
                   streak_7, streak_30, score_80, score_90, score_100,
                   blitz_10, blitz_20, games_100]
    badge_type = CharField(unique=True)
    name = CharField()
    description = CharField()
    emoji = CharField(max_length=10)

class UserBadge(models.Model):
    user = ForeignKey(User)
    badge = ForeignKey(Badge)
    earned_at = DateTimeField(auto_now_add=True)
    # unique_together: user + badge
```
Utility: `award_badge(user, badge_type)` — idempotent, creates Notification on first award
Management command to seed Badge objects.

API:
- `GET /auth/badges/` — user's earned UserBadges with badge detail

## Frontend
- Add "Badges" section to `app/(app)/profile/page.tsx`
  - Earned badges shown as emoji + name grid
  - Locked badges shown faded
