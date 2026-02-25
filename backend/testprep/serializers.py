from rest_framework import serializers
from .models import Exam, ExamSection, ExamQuestion, ExamAttempt


class ExamSectionBriefSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = ExamSection
        fields = ["id", "name", "slug", "duration_seconds", "order", "question_count"]

    def get_question_count(self, obj):
        return obj.questions.count()


class ExamSerializer(serializers.ModelSerializer):
    exam_sections = ExamSectionBriefSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ["id", "name", "slug", "description", "sections", "scoring_info", "is_active", "exam_sections"]


class ExamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ["id", "name", "slug", "description", "sections", "is_active"]


class ExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = ["id", "question_type", "prompt", "options", "difficulty", "order", "audio_key", "image_key"]
        # correct_answer intentionally excluded from API response


class ExamAttemptSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source="exam.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True, allow_null=True)

    class Meta:
        model = ExamAttempt
        fields = ["id", "exam_name", "section_name", "started_at", "completed_at", "predicted_score"]
