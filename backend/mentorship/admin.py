from django.contrib import admin
from .models import MentorProfile, MentorAvailability, MentorBundle, MentorSession


class MentorAvailabilityInline(admin.TabularInline):
    model = MentorAvailability
    extra = 1


class MentorBundleInline(admin.TabularInline):
    model = MentorBundle
    extra = 0


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "is_active", "rating_avg", "session_count", "hourly_rate"]
    list_filter = ["is_active"]
    search_fields = ["user__username"]
    list_editable = ["is_active"]
    inlines = [MentorAvailabilityInline, MentorBundleInline]


@admin.register(MentorSession)
class MentorSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "student", "mentor", "scheduled_at", "duration_minutes", "status", "price"]
    list_filter = ["status"]
    search_fields = ["student__username", "mentor__user__username"]
    readonly_fields = ["created_at"]
