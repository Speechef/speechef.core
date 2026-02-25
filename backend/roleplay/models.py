from django.db import models
from django.contrib.auth.models import User


class RolePlaySession(models.Model):
    MODE_CHOICES = [
        ("job_interview", "Job Interview"),
        ("presentation", "Presentation Pitch"),
        ("debate", "Debate"),
        ("small_talk", "Small Talk"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("finished", "Finished"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="roleplay_sessions")
    mode = models.CharField(max_length=30, choices=MODE_CHOICES)
    topic = models.CharField(max_length=200, blank=True)
    # List of {"role": "assistant"|"user", "content": "...", "timestamp": "..."}
    turns = models.JSONField(default=list)
    score = models.IntegerField(null=True, blank=True)
    ai_feedback = models.TextField(blank=True)
    tips = models.JSONField(default=list)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user.username} — {self.mode} ({self.status})"
