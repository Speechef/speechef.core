from django.db import models

CATEGORY_CHOICES = [
    ("grammar",       "Grammar"),
    ("vocabulary",    "Vocabulary"),
    ("pronunciation", "Pronunciation"),
    ("test_prep",     "Test Prep"),
    ("writing",       "Writing"),
    ("general",       "General"),
]


class Thread(models.Model):
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='threads')
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    category   = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    is_pinned  = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title


class Reply(models.Model):
    user        = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='replies')
    thread      = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='replies')
    body        = models.TextField()
    is_accepted = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Reply by {self.user.username} on "{self.thread.title}"'


class ThreadVote(models.Model):
    user   = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='votes')

    class Meta:
        unique_together = ['user', 'thread']
