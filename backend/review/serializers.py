from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expert, ExpertReview, ReviewMessage


class ExpertSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            "id", "username", "name", "bio", "credentials",
            "specialties", "languages", "hourly_rate",
            "is_active", "rating_avg", "review_count",
        ]

    def get_name(self, obj):
        u = obj.user
        return f"{u.first_name} {u.last_name}".strip() or u.username


class ExpertReviewSerializer(serializers.ModelSerializer):
    expert = ExpertSerializer(read_only=True)

    class Meta:
        model = ExpertReview
        fields = [
            "id", "review_type", "status", "expert",
            "submitted_at", "deadline_at", "delivered_at",
            "feedback_notes", "feedback_video_key", "feedback_rating",
        ]
        read_only_fields = ["status", "submitted_at", "deadline_at", "delivered_at"]


class ReviewMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = ReviewMessage
        fields = ["id", "sender_name", "body", "sent_at"]

    def get_sender_name(self, obj):
        u = obj.sender
        return f"{u.first_name} {u.last_name}".strip() or u.username
