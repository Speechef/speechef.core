from rest_framework import serializers
from .models import MentorProfile, MentorAvailability, MentorBundle, MentorSession


class MentorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorAvailability
        fields = ["id", "day_of_week", "start_time", "end_time"]


class MentorBundleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorBundle
        fields = ["id", "name", "session_count", "price"]


class MentorListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile
        fields = ["id", "name", "specialties", "languages", "hourly_rate", "rating_avg", "session_count"]

    def get_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.username


class MentorDetailSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    availability = MentorAvailabilitySerializer(many=True, read_only=True)
    bundles = MentorBundleSerializer(many=True, read_only=True)

    class Meta:
        model = MentorProfile
        fields = [
            "id", "name", "bio", "credentials", "specialties", "languages",
            "hourly_rate", "rating_avg", "session_count", "timezone",
            "intro_video_key", "availability", "bundles",
        ]

    def get_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.username


class MentorSessionSerializer(serializers.ModelSerializer):
    mentor_name = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = [
            "id", "mentor_name", "scheduled_at", "duration_minutes",
            "status", "price", "meeting_url", "homework",
            "student_rating", "student_review",
        ]

    def get_mentor_name(self, obj):
        u = obj.mentor.user
        return f"{u.first_name} {u.last_name}".strip() or u.username
