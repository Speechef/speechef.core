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
    qs = GameSession.objects.filter(user=request.user)
    game_filter = request.query_params.get('game')
    if game_filter:
        qs = qs.filter(game=game_filter)
    limit = min(int(request.query_params.get('limit', 20)), 100)
    return Response(GameSessionSerializer(qs[:limit], many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def sentence_check(request):
    """
    Evaluate whether the user's sentence correctly uses the given word.
    Returns { correct: bool, feedback: str, score: int (0-10) }
    """
    word = request.data.get('word', '').strip()
    definition = request.data.get('definition', '').strip()
    sentence = request.data.get('sentence', '').strip()

    if not word or not sentence:
        return Response({'detail': 'word and sentence are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check word presence (fast guard)
    if word.lower() not in sentence.lower():
        return Response({
            'correct': False,
            'feedback': f'Your sentence doesn\'t include the word "{word}". Try again!',
            'score': 0,
        })

    try:
        from django.conf import settings
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        prompt = (
            f'Word: "{word}"\n'
            f'Definition: "{definition}"\n'
            f'Student sentence: "{sentence}"\n\n'
            f'Evaluate whether the student used the word correctly and in proper context. '
            f'Respond ONLY with JSON: {{"correct": true/false, "feedback": "one sentence", "score": 0-10}}'
        )

        resp = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=100,
            temperature=0.2,
        )
        import json as _json
        raw = resp.choices[0].message.content.strip()
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        result = _json.loads(raw)
        return Response({
            'correct': bool(result.get('correct')),
            'feedback': result.get('feedback', ''),
            'score': min(10, max(0, int(result.get('score', 5)))),
        })
    except Exception as e:
        # Fallback: basic keyword check
        return Response({
            'correct': True,
            'feedback': 'Good attempt! Keep practising.',
            'score': 5,
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def daily_challenge(request):
    """Return a consistent daily word question seeded by today's date."""
    import datetime
    today = datetime.date.today().isoformat()  # "2026-02-25"
    ids = list(WordQuestion.objects.values_list('pk', flat=True).order_by('pk'))
    if not ids:
        return Response({'detail': 'No questions available.'}, status=status.HTTP_404_NOT_FOUND)
    seed = int(today.replace('-', '')) % len(ids)
    q = WordQuestion.objects.get(pk=ids[seed])
    data = WordQuestionSerializer(q).data
    data['date'] = today
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def guess_complete(request):
    """Save the final score of a completed Guess the Word run."""
    score = int(request.data.get('score', 0))
    game = request.data.get('game', 'guess')
    if request.user.is_authenticated:
        GameSession.objects.create(user=request.user, game=game, score=score)
        try:
            from users.badges import award_badge
            # Blitz-specific badges
            if game == 'blitz':
                if score >= 20:
                    award_badge(request.user, 'blitz_20')
                elif score >= 10:
                    award_badge(request.user, 'blitz_10')
            # Total games played badge
            total = GameSession.objects.filter(user=request.user).count()
            if total >= 10:
                award_badge(request.user, 'games_10')
        except Exception:
            pass
    return Response({'saved': request.user.is_authenticated, 'score': score})


@api_view(['POST'])
@permission_classes([AllowAny])
def pronunciation_check(request):
    """
    Accepts multipart/form-data with `audio` file and `target` string.
    Transcribes audio via Whisper, compares to target with difflib.
    Returns { transcript, accuracy, mismatches }.
    """
    import difflib
    target = request.data.get('target', '').strip()
    audio_file = request.FILES.get('audio')

    if not target or not audio_file:
        return Response({'detail': 'audio and target are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from django.conf import settings
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        result = client.audio.transcriptions.create(
            model='whisper-1',
            file=audio_file,
            language='en',
        )
        transcript = result.text.strip()
    except Exception:
        return Response({'detail': 'Transcription failed. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # Tokenise and compare
    target_words = target.lower().split()
    transcript_words = transcript.lower().split()

    matcher = difflib.SequenceMatcher(None, target_words, transcript_words)
    ratio = matcher.ratio()
    accuracy = round(ratio * 100)

    # Find words in target that were missed / mispronounced
    mismatches = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in ('replace', 'delete'):
            mismatches.extend(target_words[i1:i2])

    return Response({
        'transcript': transcript,
        'accuracy': accuracy,
        'mismatches': mismatches,
    })


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
