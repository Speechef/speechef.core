import random
from rest_framework import serializers
from .models import WordQuestion, GameSession


class WordQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = WordQuestion
        fields = ['id', 'word', 'options']

    def get_options(self, obj):
        options = obj.get_options()
        random.shuffle(options)
        return options


class MemoryMatchPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordQuestion
        fields = ['id', 'word', 'correct_meaning']


class WordScrambleSerializer(serializers.ModelSerializer):
    scrambled = serializers.SerializerMethodField()

    class Meta:
        model = WordQuestion
        fields = ['id', 'scrambled']

    def get_scrambled(self, obj):
        letters = list(obj.word)
        scrambled = obj.word
        attempts = 0
        while scrambled == obj.word and len(obj.word) > 1 and attempts < 10:
            random.shuffle(letters)
            scrambled = ''.join(letters)
            attempts += 1
        return scrambled


class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'game', 'score', 'played_at']
        read_only_fields = ['played_at']


class LeaderboardSerializer(serializers.Serializer):
    username = serializers.CharField(source='user__username')
    total_score = serializers.IntegerField()
    games_played = serializers.IntegerField()
