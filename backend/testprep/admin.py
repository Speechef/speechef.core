from django.contrib import admin
from .models import Exam, ExamSection, ExamQuestion, ExamAttempt


class ExamSectionInline(admin.TabularInline):
    model = ExamSection
    extra = 1
    show_change_link = True


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 0
    fields = ["question_type", "difficulty", "order", "prompt"]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "slug", "is_active"]
    list_editable = ["is_active"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ExamSectionInline]


@admin.register(ExamSection)
class ExamSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "exam", "name", "duration_seconds", "order"]
    list_filter = ["exam"]
    inlines = [ExamQuestionInline]


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ["id", "section", "question_type", "difficulty", "order"]
    list_filter = ["question_type", "difficulty", "section__exam"]
    search_fields = ["prompt"]


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "exam", "section", "started_at", "completed_at", "predicted_score"]
    list_filter = ["exam"]
    search_fields = ["user__username"]
    readonly_fields = ["started_at"]
