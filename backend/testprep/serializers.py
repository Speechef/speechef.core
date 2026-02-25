from rest_framework import serializers
from .models import Exam, ExamSection, ExamQuestion, ExamAttempt


class ExamSectionBriefSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    section_type = serializers.SerializerMethodField()
    time_limit_minutes = serializers.SerializerMethodField()
    description = serializers.CharField(source='instructions', default='')

    class Meta:
        model = ExamSection
        fields = [
            "id", "name", "slug", "duration_seconds", "order",
            "question_count", "section_type", "time_limit_minutes", "description",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_section_type(self, obj):
        name_lower = obj.name.lower()
        if 'speaking' in name_lower:
            return 'speaking'
        elif 'writing' in name_lower:
            return 'writing'
        elif 'listening' in name_lower:
            return 'listening'
        elif 'reading' in name_lower:
            return 'reading'
        return 'general'

    def get_time_limit_minutes(self, obj):
        return round(obj.duration_seconds / 60)


class ExamSerializer(serializers.ModelSerializer):
    sections = ExamSectionBriefSerializer(source='exam_sections', many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ["id", "name", "slug", "description", "scoring_info", "is_active", "sections"]


class ExamListSerializer(serializers.ModelSerializer):
    sections = ExamSectionBriefSerializer(source='exam_sections', many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ["id", "name", "slug", "description", "scoring_info", "is_active", "sections"]


class ExamQuestionSerializer(serializers.ModelSerializer):
    time_limit_seconds = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ExamQuestion
        fields = [
            "id", "question_type", "prompt", "options", "difficulty", "order",
            "audio_key", "image_key", "time_limit_seconds", "audio_url", "image_url",
            "band_descriptors",
        ]
        # correct_answer intentionally excluded from API response

    def get_time_limit_seconds(self, obj):
        return None  # Per-question timers reserved for future use

    def get_audio_url(self, obj):
        return obj.audio_key  # Will be S3 URL when storage is integrated

    def get_image_url(self, obj):
        return obj.image_key  # Will be S3 URL when storage is integrated


class ExamAttemptSerializer(serializers.ModelSerializer):
    exam = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt
        fields = ["id", "exam", "section", "started_at", "completed_at", "predicted_score"]

    def get_exam(self, obj):
        return {"name": obj.exam.name, "slug": obj.exam.slug}

    def get_section(self, obj):
        if obj.section:
            return {"title": obj.section.name, "slug": obj.section.slug}
        return None
