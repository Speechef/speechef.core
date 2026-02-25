from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(post_save, sender=Profile)
def check_streak_badges(sender, instance, **kwargs):
    """Award streak badges when milestones are reached."""
    try:
        from .badges import award_badge
        streak = instance.current_streak
        if streak >= 30:
            award_badge(instance.user, 'streak_30')
        elif streak >= 7:
            award_badge(instance.user, 'streak_7')
    except Exception:
        pass