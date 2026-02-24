import random
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Max

from .models import WordQuestion, GameSession
from .serializers import (
    WordQuestionSerializer,
    MemoryMatchPairSerializer,
    WordScrambleSerializer,
    GameSessionSerializer,
)


def _random_question():
    """Return a random WordQuestion or None if table is empty."""
    ids = list(WordQuestion.objects.values_list('pk', flat=True))
    if not ids:
        return None
    return WordQuestion.objects.get(pk=random.choice(ids))


@api_view(['GET'])
@permission_classes([AllowAny])
def question(request):
    q = _random_question()
    if q is None:
        return Response(
            {'detail': 'No questions available.'},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(WordQuestionSerializer(q).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def guess(request):
    question_id = request.data.get('question_id')
    answer = request.data.get('answer', '').strip()

    if not question_id or not answer:
        return Response(
            {'detail': 'question_id and answer are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        q = WordQuestion.objects.get(pk=question_id)
    except WordQuestion.DoesNotExist:
        return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

    correct = answer == q.correct_meaning

    return Response({'correct': correct, 'correct_meaning': q.correct_meaning})


@api_view(['GET'])
@permission_classes([AllowAny])
def memory_match(request):
    count = min(int(request.query_params.get('count', 6)), 20)
    questions = list(WordQuestion.objects.all())
    if not questions:
        return Response(
            {'detail': 'No questions available.'},
            status=status.HTTP_404_NOT_FOUND,
        )
    pairs = random.sample(questions, min(count, len(questions)))
    return Response(MemoryMatchPairSerializer(pairs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def word_scramble(request):
    q = _random_question()
    if q is None:
        return Response(
            {'detail': 'No questions available.'},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(WordScrambleSerializer(q).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def word_scramble_check(request):
    question_id = request.data.get('question_id')
    answer = request.data.get('answer', '').strip()

    if not question_id or not answer:
        return Response(
            {'detail': 'question_id and answer are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        q = WordQuestion.objects.get(pk=question_id)
    except WordQuestion.DoesNotExist:
        return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

    correct = answer.lower() == q.word.lower()
    score = 10 if correct else 0

    if request.user.is_authenticated:
        GameSession.objects.create(user=request.user, game='scramble', score=score)

    return Response({'correct': correct, 'score': score, 'word': q.word})


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    game_filter = request.query_params.get('game')
    sessions = GameSession.objects.all()
    if game_filter:
        sessions = sessions.filter(game=game_filter)

    top = (
        sessions
        .values('user__username')
        .annotate(total_score=Sum('score'), games_played=Count('id'))
        .order_by('-total_score')[:10]
    )
    return Response(list(top))


@api_view(['GET'])
@permission_classes([AllowAny])
def sessions(request):
    if not request.user.is_authenticated:
        return Response([])
    qs = GameSession.objects.filter(user=request.user)[:20]
    return Response(GameSessionSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def guess_complete(request):
    """Save the final score of a completed Guess the Word run."""
    score = int(request.data.get('score', 0))
    if request.user.is_authenticated:
        GameSession.objects.create(user=request.user, game='guess', score=score)
    return Response({'saved': request.user.is_authenticated, 'score': score})


@api_view(['GET'])
@permission_classes([AllowAny])
def my_best(request):
    """Return the authenticated user's highest score for a given game."""
    if not request.user.is_authenticated:
        return Response({'best': 0})
    game = request.query_params.get('game', 'guess')
    best = GameSession.objects.filter(user=request.user, game=game).aggregate(
        best=Max('score')
    )['best']
    return Response({'best': best or 0})
