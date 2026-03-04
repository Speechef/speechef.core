from django.db import models
from django.contrib.auth.models import User
from PIL import Image

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_played_date = models.DateField(null=True, blank=True)
    notification_prefs = models.JSONField(default=dict, blank=True)
    privacy_prefs = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'
    
    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)
        try:
            img = Image.open(self.image.path)
            if img.height > 300 or img.width > 300:
                output_size = (300, 300)
                img.thumbnail(output_size)
                img.save(self.image.path)
        except Exception:
            pass


class Notification(models.Model):
    TYPE_CHOICES = [
        ('streak_risk', 'Streak at Risk'),
        ('review_ready', 'Review Ready'),
        ('job_match', 'Job Match'),
        ('score_improvement', 'Score Improvement'),
        ('badge_earned', 'Badge Earned'),
        ('general', 'General'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    link = models.CharField(max_length=200, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.title}'


class Badge(models.Model):
    badge_type = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.emoji} {self.name}'


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']

    def __str__(self):
        return f'{self.user.username} — {self.badge.name}'