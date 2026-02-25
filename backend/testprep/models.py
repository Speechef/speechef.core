from django.db import models
from django.contrib.auth.models import User


class Exam(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    sections = models.JSONField(default=list)
    scoring_info = models.JSONField(default=dict)
    logo = models.ImageField(upload_to="exam_logos/", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ExamSection(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="exam_sections")
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    duration_seconds = models.IntegerField(default=600)
    instructions = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = ["exam", "slug"]

    def __str__(self):
        return f"{self.exam.name} — {self.name}"


class ExamQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ("multiple_choice", "Multiple Choice"),
        ("free_speech", "Free Speech"),
        ("fill_blank", "Fill in the Blank"),
        ("essay_prompt", "Essay Prompt"),
        ("listen_and_answer", "Listen and Answer"),
        ("read_and_respond", "Read and Respond"),
    ]
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    section = models.ForeignKey(ExamSection, on_delete=models.CASCADE, related_name="questions")
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPE_CHOICES)
    prompt = models.TextField()
    audio_key = models.CharField(max_length=500, null=True, blank=True)
    image_key = models.CharField(max_length=500, null=True, blank=True)
    options = models.JSONField(null=True, blank=True)
    correct_answer = models.TextField(null=True, blank=True)
    band_descriptors = models.JSONField(null=True, blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.section} — Q{self.order}: {self.prompt[:60]}"


class ExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="exam_attempts")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    section = models.ForeignKey(ExamSection, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    predicted_score = models.JSONField(null=True, blank=True)
    answers = models.JSONField(default=list)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user.username} — {self.exam.name} — {self.started_at.date()}"
