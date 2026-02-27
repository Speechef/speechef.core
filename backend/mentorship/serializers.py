from rest_framework import serializers
from .models import (
    MentorProfile, MentorAvailability, MentorBundle, MentorSession,
    MentorUnavailability, UserBundle, MentorStudentNote,
)


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
    intro_available = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile
        fields = [
            "id", "name", "bio", "credentials", "specialties", "languages",
            "hourly_rate", "rating_avg", "session_count", "timezone",
            "intro_video_key", "availability", "bundles",
            "offers_intro_call", "intro_available",
        ]

    def get_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.username

    def get_intro_available(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if not obj.offers_intro_call:
            return False
        return not MentorSession.objects.filter(mentor=obj, student=request.user).exists()


class MentorSessionSerializer(serializers.ModelSerializer):
    mentor_name = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = [
            "id", "mentor_name", "scheduled_at", "duration_minutes",
            "status", "price", "meeting_url", "homework",
            "student_rating", "student_review",
            "cancelled_by", "cancelled_at", "cancellation_reason", "refund_amount",
            "mentor_reply", "mentor_replied_at",
        ]

    def get_mentor_name(self, obj):
        u = obj.mentor.user
        return f"{u.first_name} {u.last_name}".strip() or u.username


class MentorDashboardSessionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_initial = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = [
            "id", "student_name", "student_initial",
            "scheduled_at", "duration_minutes", "status", "meeting_url",
            "homework", "student_rating", "student_review",
            "mentor_reply", "mentor_replied_at",
        ]

    def get_student_name(self, obj):
        u = obj.student
        return f"{u.first_name} {u.last_name}".strip() or u.username

    def get_student_initial(self, obj):
        u = obj.student
        name = f"{u.first_name} {u.last_name}".strip() or u.username
        return name[0].upper()


class RecentStudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_initial = serializers.CharField()
    last_session_at = serializers.DateTimeField()
    session_count = serializers.IntegerField()


class MentorUnavailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorUnavailability
        fields = ["id", "start_date", "end_date", "reason"]


class UserBundleSerializer(serializers.ModelSerializer):
    bundle_name = serializers.CharField(source="bundle.name")
    mentor_name = serializers.SerializerMethodField()
    total_sessions = serializers.IntegerField(source="bundle.session_count")

    class Meta:
        model = UserBundle
        fields = [
            "id", "bundle_name", "mentor_name", "total_sessions",
            "sessions_remaining", "purchased_at", "expires_at",
        ]

    def get_mentor_name(self, obj):
        u = obj.mentor.user
        return f"{u.first_name} {u.last_name}".strip() or u.username


class MentorStudentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorStudentNote
        fields = ["note", "updated_at"]
