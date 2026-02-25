from django.contrib import admin
from .models import Jobs, EmployerProfile, JobApplication


@admin.register(Jobs)
class JobsAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "company", "employment_type", "remote", "min_speechef_score", "is_featured", "date"]
    list_filter = ["remote", "is_featured", "employment_type"]
    search_fields = ["title", "company"]
    list_editable = ["is_featured"]


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "company_name", "user", "industry", "company_size", "verified"]
    list_filter = ["verified", "industry"]
    search_fields = ["company_name", "user__username"]
    list_editable = ["verified"]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "applicant", "job", "status", "speechef_score_at_apply", "applied_at"]
    list_filter = ["status"]
    search_fields = ["applicant__username", "job__title"]
    list_editable = ["status"]
