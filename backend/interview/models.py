from django.db import models


class InterviewSession(models.Model):
    MODE_CHOICES = [
        ("behavioral", "Behavioral"),
        ("technical",  "Technical"),
        ("hr",         "HR / Competency"),
        ("mixed",      "Mixed"),
    ]
    DIFF_CHOICES = [
        ("easy",   "Entry Level"),
        ("medium", "Mid Level"),
        ("hard",   "Senior Level"),
    ]
    STATUS_CHOICES = [
        ("active",   "Active"),
        ("finished", "Finished"),
    ]

    user             = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='interview_sessions')
    role             = models.CharField(max_length=150)
    company_type     = models.CharField(max_length=100, blank=True)
    mode             = models.CharField(max_length=20, choices=MODE_CHOICES, default='behavioral')
    difficulty       = models.CharField(max_length=10, choices=DIFF_CHOICES, default='medium')
    turns            = models.JSONField(default=list)
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    overall_score    = models.IntegerField(null=True, blank=True)
    summary_feedback = models.TextField(blank=True)
    strengths        = models.JSONField(default=list)
    improvements     = models.JSONField(default=list)
    started_at       = models.DateTimeField(auto_now_add=True)
    finished_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user.username} — {self.role} — {self.mode}'
