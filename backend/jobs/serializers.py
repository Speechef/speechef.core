from rest_framework import serializers
from .models import Jobs, JobApplication, EmployerProfile


class JobListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jobs
        fields = [
            "id", "title", "company", "location", "remote",
            "employment_type", "job_rate", "min_speechef_score",
            "is_featured", "date", "url",
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Jobs
        fields = [
            "id", "title", "description", "company", "location", "remote",
            "employment_type", "job_rate", "min_speechef_score",
            "required_languages", "is_featured", "date",
            "url", "application_url", "application_count",
        ]

    def get_application_count(self, obj):
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jobs
        fields = [
            "title", "company", "description", "location", "remote",
            "employment_type", "job_rate", "min_speechef_score",
            "application_url", "url",
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company = serializers.CharField(source="job.company", read_only=True)

    class Meta:
        model = JobApplication
        fields = ["id", "job_title", "company", "status", "applied_at", "speechef_score_at_apply"]
        read_only_fields = ["status", "applied_at"]
