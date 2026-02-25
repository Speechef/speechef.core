from django.db import models
from django.contrib.auth.models import User


class AnalysisSession(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ]
    FILE_TYPE_CHOICES = [
        ('audio', 'Audio'),
        ('video', 'Video'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_sessions')
    file_key = models.CharField(max_length=500)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} \u2014 {self.file_type} \u2014 {self.status}'


class AnalysisResult(models.Model):
    session = models.OneToOneField(AnalysisSession, on_delete=models.CASCADE, related_name='result')
    transcript = models.TextField()
    segments = models.JSONField(default=list)
    overall_score = models.IntegerField(default=0)
    fluency_score = models.IntegerField(default=0)
    vocabulary_score = models.IntegerField(default=0)
    pace_wpm = models.IntegerField(default=0)
    filler_words = models.JSONField(default=list)
    grammar_errors = models.JSONField(default=list)
    tone = models.CharField(max_length=100, blank=True)
    improvement_priorities = models.JSONField(default=list)
    narrative_feedback = models.TextField(blank=True)

    def __str__(self):
        return f'Result for session {self.session_id} \u2014 score {self.overall_score}'
