from django.db import models
from django.contrib.auth.models import User


class MentorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="mentor_profile")
    bio = models.TextField()
    credentials = models.TextField()
    specialties = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    intro_video_key = models.CharField(max_length=500, null=True, blank=True)
    profile_photo = models.ImageField(upload_to="mentor_photos/", null=True, blank=True)
    timezone = models.CharField(max_length=50, default="UTC")
    is_active = models.BooleanField(default=False)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    session_count = models.IntegerField(default=0)
    stripe_account_id = models.CharField(max_length=200, null=True, blank=True)
    offers_intro_call = models.BooleanField(default=False)  # MM8.1
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mentor: {self.user.username}"


class MentorAvailability(models.Model):
    DAY_CHOICES = [
        ("mon", "Monday"),
        ("tue", "Tuesday"),
        ("wed", "Wednesday"),
        ("thu", "Thursday"),
        ("fri", "Friday"),
        ("sat", "Saturday"),
        ("sun", "Sunday"),
    ]

    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="availability")
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ["day_of_week", "start_time"]
        verbose_name_plural = "Mentor Availability"

    def __str__(self):
        return f"{self.mentor.user.username} — {self.day_of_week} {self.start_time}–{self.end_time}"


class MentorUnavailability(models.Model):
    """Date ranges when a mentor is explicitly blocked. MM7.1"""
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="unavailability")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["start_date"]
        verbose_name_plural = "Mentor Unavailability"

    def __str__(self):
        return f"{self.mentor.user.username} blocked {self.start_date}–{self.end_date}"


class MentorBundle(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="bundles")
    name = models.CharField(max_length=100)
    session_count = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.mentor.user.username} — {self.name}"


class UserBundle(models.Model):
    """A purchased bundle of sessions for a specific mentor. MM4.1"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bundles")
    bundle = models.ForeignKey(MentorBundle, on_delete=models.CASCADE, related_name="purchases")
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="sold_bundles")
    sessions_remaining = models.IntegerField()
    stripe_checkout_session = models.CharField(max_length=200, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-purchased_at"]

    def __str__(self):
        return f"{self.user.username} — {self.bundle.name} ({self.sessions_remaining} left)"


class MentorSession(models.Model):
    STATUS_CHOICES = [
        ("pending_payment", "Pending Payment"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No Show"),
    ]

    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="sessions")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_sessions")
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending_payment")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stripe_payment_intent = models.CharField(max_length=200, blank=True)
    meeting_url = models.URLField(null=True, blank=True)
    recording_key = models.CharField(max_length=500, null=True, blank=True)
    homework = models.TextField(blank=True)
    student_rating = models.IntegerField(null=True, blank=True)
    student_review = models.TextField(blank=True)
    # MM6.1 — cancellation
    cancelled_by = models.CharField(max_length=10, null=True, blank=True)  # 'student' | 'mentor'
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)
    refund_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    # MM9.1 — mentor reply to review
    mentor_reply = models.TextField(blank=True)
    mentor_replied_at = models.DateTimeField(null=True, blank=True)
    # MM6.2 — student rescheduling
    rescheduled_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return f"{self.student.username} with {self.mentor.user.username} — {self.scheduled_at}"


class MentorStudentNote(models.Model):
    """Mentor's private note/goal for a specific student. MM10.1"""
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name="student_notes")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_notes")
    note = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["mentor", "student"]]

    def __str__(self):
        return f"{self.mentor.user.username} note for {self.student.username}"
