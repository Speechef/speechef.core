from django.contrib import admin
from .models import Expert, ExpertReview


@admin.register(Expert)
class ExpertAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "is_active", "rating_avg", "review_count", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["user__username", "credentials"]
    list_editable = ["is_active"]


@admin.register(ExpertReview)
class ExpertReviewAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "expert", "review_type", "status", "submitted_at", "deadline_at"]
    list_filter = ["status", "review_type"]
    search_fields = ["user__username"]
    readonly_fields = ["submitted_at"]
    list_editable = ["status"]
