from rest_framework import serializers
from .models import AnalysisSession, AnalysisResult


class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = [
            "transcript", "segments", "overall_score", "fluency_score",
            "vocabulary_score", "pace_wpm", "filler_words", "grammar_errors",
            "tone", "improvement_priorities", "narrative_feedback",
        ]


class AnalysisSessionSerializer(serializers.ModelSerializer):
    result = AnalysisResultSerializer(read_only=True)
    mentor_session_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = AnalysisSession
        fields = ["id", "file_type", "status", "source", "mentor_session_id", "created_at", "completed_at", "error", "result"]
