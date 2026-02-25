from django.db import models
from django.contrib.auth.models import User


class Jobs(models.Model):
    EMPLOYMENT_TYPE_CHOICES = [
        ("full_time", "Full Time"),
        ("part_time", "Part Time"),
        ("contract", "Contract"),
        ("freelance", "Freelance"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    company = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=100, blank=True)
    job_rate = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    url = models.URLField(blank=True)

    # New fields (J2.1)
    min_speechef_score = models.IntegerField(null=True, blank=True)
    required_languages = models.JSONField(default=list)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, blank=True)
    remote = models.BooleanField(default=False)
    application_url = models.URLField(null=True, blank=True)
    company_logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    posted_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="posted_jobs"
    )

    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Jobs"

    def __str__(self):
        return self.title


class EmployerProfile(models.Model):
    COMPANY_SIZE_CHOICES = [
        ("1-10", "1–10"),
        ("11-50", "11–50"),
        ("51-200", "51–200"),
        ("201-1000", "201–1,000"),
        ("1000+", "1,000+"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=200)
    company_website = models.URLField(blank=True)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZE_CHOICES, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("viewed", "Viewed"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
    ]

    job = models.ForeignKey(Jobs, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_applications")
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_note = models.TextField(blank=True)
    speechef_score_at_apply = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")

    class Meta:
        unique_together = ["job", "applicant"]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title}"
