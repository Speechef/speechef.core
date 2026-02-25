from rest_framework import serializers
from .models import RolePlaySession


class RolePlaySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePlaySession
        fields = [
            "id", "mode", "topic", "turns", "score",
            "ai_feedback", "tips", "started_at", "finished_at", "status",
        ]
        read_only_fields = [
            "id", "turns", "score", "ai_feedback", "tips", "started_at", "finished_at", "status",
        ]


class RolePlaySessionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePlaySession
        fields = ["id", "mode", "topic", "score", "status", "started_at", "finished_at"]
