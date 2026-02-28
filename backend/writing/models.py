from django.db import models


class WritingSession(models.Model):
    TEXT_TYPES = [
        ("essay",        "Essay"),
        ("email",        "Email"),
        ("cover_letter", "Cover Letter"),
        ("ielts_task1",  "IELTS Task 1"),
        ("ielts_task2",  "IELTS Task 2"),
    ]
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='writing_sessions')
    text_type  = models.CharField(max_length=20, choices=TEXT_TYPES)
    input_text = models.TextField()
    word_count = models.IntegerField(default=0)
    score      = models.IntegerField(null=True, blank=True)
    feedback   = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.text_type} — {self.score}'


class ResumeSession(models.Model):
    user        = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='resume_sessions')
    resume_text = models.TextField()
    target_role = models.CharField(max_length=150, blank=True)
    feedback    = models.JSONField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.target_role or "Resume"}'
