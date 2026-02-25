from django.db import models
from django.contrib.auth.models import User


class Expert(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="expert_profile")
    bio = models.TextField()
    credentials = models.TextField()
    specialties = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    intro_video_key = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Expert: {self.user.username} (active={self.is_active})"


class ExpertReview(models.Model):
    REVIEW_TYPE_CHOICES = [
        ("general", "General"),
        ("ielts_speaking", "IELTS Speaking"),
        ("job_interview", "Job Interview"),
        ("presentation", "Presentation"),
    ]
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("assigned", "Assigned"),
        ("in_review", "In Review"),
        ("delivered", "Delivered"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expert_reviews")
    expert = models.ForeignKey(Expert, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    video_key = models.CharField(max_length=500)
    review_type = models.CharField(max_length=30, choices=REVIEW_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    price_paid = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    stripe_payment_intent = models.CharField(max_length=200, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    deadline_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    feedback_video_key = models.CharField(max_length=500, null=True, blank=True)
    feedback_notes = models.TextField(null=True, blank=True)
    feedback_rating = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Review #{self.id} — {self.user.username} — {self.status}"


class ReviewMessage(models.Model):
    """Follow-up Q&A thread between user and expert on a review."""
    review = models.ForeignKey(ExpertReview, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="review_messages")
    body = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sent_at"]

    def __str__(self):
        return f"Message by {self.sender.username} on Review #{self.review_id}"
