"""
Badge award utility.
Usage: from users.badges import award_badge
       award_badge(request.user, 'first_analysis')
"""
from __future__ import annotations
from django.contrib.auth.models import User


def award_badge(user: User, badge_type: str) -> bool:
    """
    Award a badge to a user idempotently.
    Returns True if the badge was newly awarded, False if they already had it.
    Also creates a Notification if newly awarded.
    """
    from .models import Badge, UserBadge, Notification

    try:
        badge = Badge.objects.get(badge_type=badge_type)
    except Badge.DoesNotExist:
        return False

    _, created = UserBadge.objects.get_or_create(user=user, badge=badge)

    if created:
        Notification.objects.create(
            user=user,
            title=f'Badge earned: {badge.name}',
            body=badge.description,
            notification_type='badge_earned',
            link='/profile',
        )

    return created
