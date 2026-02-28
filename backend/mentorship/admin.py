from django.contrib import admin
from django.utils import timezone
from .models import MentorProfile, MentorAvailability, MentorBundle, MentorSession, MentorApplication


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


@admin.register(MentorApplication)
class MentorApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "user", "status", "experience_years", "hourly_rate", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "email", "user__username"]
    readonly_fields = ["user", "created_at", "updated_at"]
    actions = ["approve_applications", "reject_applications"]

    def approve_applications(self, request, queryset):
        approved = 0
        for app in queryset.filter(status="pending"):
            user = app.user
            # Create MentorProfile if it doesn't exist
            if not MentorProfile.objects.filter(user=user).exists():
                MentorProfile.objects.create(
                    user=user,
                    bio=app.bio,
                    credentials=app.credentials,
                    specialties=app.specialties,
                    languages=app.languages,
                    hourly_rate=app.hourly_rate,
                    timezone="UTC",
                    is_active=True,
                )
            else:
                # Activate existing profile
                MentorProfile.objects.filter(user=user).update(is_active=True)
            app.status = "approved"
            app.reviewed_at = timezone.now()
            app.save(update_fields=["status", "reviewed_at"])
            approved += 1
        self.message_user(request, f"Approved {approved} application(s) and created mentor profile(s).")
    approve_applications.short_description = "Approve selected and create mentor profiles"

    def reject_applications(self, request, queryset):
        updated = queryset.filter(status="pending").update(status="rejected", reviewed_at=timezone.now())
        self.message_user(request, f"Rejected {updated} application(s).")
    reject_applications.short_description = "Reject selected applications"
