from django.contrib import admin
from .models import AnalysisSession, AnalysisResult


class AnalysisResultInline(admin.StackedInline):
    model = AnalysisResult
    can_delete = False
    readonly_fields = ['overall_score', 'fluency_score', 'vocabulary_score', 'pace_wpm', 'tone']


@admin.register(AnalysisSession)
class AnalysisSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'file_type', 'status', 'created_at', 'completed_at']
    list_filter = ['status', 'file_type']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'completed_at']
    inlines = [AnalysisResultInline]


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'overall_score', 'fluency_score', 'pace_wpm', 'tone']
    readonly_fields = ['session']
