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


def _get_top_badge(mentor_profile):
    """Return the highest top_mentor badge for a mentor, or None. MM9.2"""
    try:
        from users.models import UserBadge
        badge_order = ['top_mentor_elite', 'top_mentor', 'top_mentor_rising']
        ubs = UserBadge.objects.filter(
            user=mentor_profile.user,
            badge__badge_type__in=badge_order,
        ).select_related('badge')
        ub_by_type = {ub.badge.badge_type: ub.badge for ub in ubs}
        for bt in badge_order:
            if bt in ub_by_type:
                b = ub_by_type[bt]
                return {'badge_type': b.badge_type, 'name': b.name, 'emoji': b.emoji}
    except Exception:
        pass
    return None


class MentorListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    top_badge = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    member_since_days = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile
        fields = ["id", "name", "bio", "specialties", "languages", "hourly_rate", "rating_avg", "session_count", "review_count", "top_badge", "member_since_days", "follower_count"]

    def get_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.username

    def get_top_badge(self, obj):
        return _get_top_badge(obj)

    def get_review_count(self, obj):
        return MentorSession.objects.filter(mentor=obj, student_rating__isnull=False).count()

    def get_member_since_days(self, obj):
        from django.utils import timezone
        return (timezone.now() - obj.created_at).days

    def get_follower_count(self, obj):
        return obj.followers.count()


class MentorDetailSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    availability = MentorAvailabilitySerializer(many=True, read_only=True)
    bundles = MentorBundleSerializer(many=True, read_only=True)
    intro_available = serializers.SerializerMethodField()
    top_badge = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    member_since_days = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile
        fields = [
            "id", "name", "bio", "credentials", "specialties", "languages",
            "hourly_rate", "rating_avg", "session_count", "review_count", "timezone",
            "intro_video_key", "availability", "bundles",
            "offers_intro_call", "intro_available", "top_badge", "member_since_days",
            "follower_count", "is_following",
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

    def get_top_badge(self, obj):
        return _get_top_badge(obj)

    def get_review_count(self, obj):
        return MentorSession.objects.filter(mentor=obj, student_rating__isnull=False).count()

    def get_member_since_days(self, obj):
        from django.utils import timezone
        return (timezone.now() - obj.created_at).days

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_is_following(self, obj):
        from .models import MentorFollow
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return MentorFollow.objects.filter(user=request.user, mentor=obj).exists()


class MentorSessionSerializer(serializers.ModelSerializer):
    mentor = serializers.SerializerMethodField()
    analysis_session_id = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = [
            "id", "mentor", "scheduled_at", "duration_minutes",
            "status", "price", "meeting_url", "recording_key", "homework",
            "student_rating", "student_review",
            "cancelled_by", "cancelled_at", "cancellation_reason", "refund_amount",
            "mentor_reply", "mentor_replied_at",
            "rescheduled_count", "analysis_session_id",
        ]

    def get_mentor(self, obj):
        u = obj.mentor.user
        name = f"{u.first_name} {u.last_name}".strip() or u.username
        return {"id": obj.mentor.id, "name": name}

    def get_analysis_session_id(self, obj):
        """Return the ID of the linked AnalysisSession (MM3.3), if any."""
        session = obj.analysis_sessions.filter(source='mentor_session').order_by('-created_at').first()
        if session:
            return session.id
        return None


class MentorDashboardSessionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_initial = serializers.SerializerMethodField()

    class Meta:
        model = MentorSession
        fields = [
            "id", "student_name", "student_initial",
            "scheduled_at", "duration_minutes", "status", "meeting_url",
            "recording_key", "homework", "student_rating", "student_review",
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


class MentorProfileEditSerializer(serializers.ModelSerializer):
    """Read / partial-update serializer for a mentor's own profile. MM12.1, MM14.1"""

    class Meta:
        model = MentorProfile
        fields = [
            "bio", "credentials", "specialties", "languages",
            "hourly_rate", "timezone", "offers_intro_call", "intro_video_key",
        ]
