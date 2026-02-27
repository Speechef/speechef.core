# N1.1 — Notification Center

## Status: Unblocked

## Summary
In-app notification system. Backend stores notifications; frontend shows a bell icon with unread count in the app layout, plus a full /notifications page.

## Backend (users app)
New models in users/models.py:
```python
class Notification(models.Model):
    TYPE_CHOICES = [streak_risk, review_ready, job_match, score_improvement, general, badge_earned]
    user = ForeignKey(User)
    title = CharField(max_length=200)
    body = TextField(blank=True)
    notification_type = CharField(choices=TYPE_CHOICES)
    link = CharField(blank=True)   # frontend route e.g. /review/5
    read = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

API in users/api_urls.py:
- `GET /auth/notifications/` — last 20 notifications for user
- `POST /auth/notifications/<id>/read/` — mark one as read
- `POST /auth/notifications/read-all/` — mark all as read

## Frontend
- `components/layout/NotificationBell.tsx` — bell icon + unread badge + dropdown (last 5)
- `app/(app)/notifications/page.tsx` — full notification list
- Add bell to the app layout navbar (next to profile link)
