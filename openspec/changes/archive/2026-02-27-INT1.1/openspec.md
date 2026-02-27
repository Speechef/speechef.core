# INT1.1 — Badge + Notification Event Wiring

## Status: Unblocked

## Summary
Wire `award_badge()` and `Notification.objects.create()` into all relevant events.
Currently AC1.1 built the infrastructure; INT1.1 activates it by hooking into real events.

## Events to wire

| Event | File | Badge(s) + Notification |
|---|---|---|
| Analysis completed (Celery) | analysis/tasks.py | first_analysis, score_80/90/100, score_improvement notif |
| Review submitted | review/api_views.py | first_review |
| Role play finished | roleplay/api_views.py | first_roleplay |
| Job applied | jobs/api_views.py | first_job_apply |
| Blitz score saved | practice/api_views.py | blitz_10, blitz_20, games_10 |
| Profile streak updated (signal) | users/signals.py | streak_7, streak_30 |
