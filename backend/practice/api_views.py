import random
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Max

from .models import WordQuestion, GameSession, VocabWord, UserVocabProgress, SavedWord
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


# ─── Vocabulary Tracker ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def vocab_list(request):
    """
    GET /practice/vocab/
    Returns paginated vocab words with per-user known status.
    Query params: difficulty=basic|intermediate|advanced, exam_tag=ielts|toefl|…, known=true|false
    """
    qs = VocabWord.objects.all()

    difficulty = request.query_params.get('difficulty')
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    exam_tag = request.query_params.get('exam_tag')
    if exam_tag:
        qs = qs.filter(exam_tags__contains=exam_tag)

    # Build known map for authenticated users
    known_ids = set()
    unknown_ids = set()
    if request.user.is_authenticated:
        progress = UserVocabProgress.objects.filter(
            user=request.user, word__in=qs
        ).values_list('word_id', 'known')
        for word_id, k in progress:
            if k:
                known_ids.add(word_id)
            else:
                unknown_ids.add(word_id)

    known_filter = request.query_params.get('known')
    if known_filter == 'true' and request.user.is_authenticated:
        qs = qs.filter(id__in=known_ids)
    elif known_filter == 'false' and request.user.is_authenticated:
        qs = qs.exclude(id__in=known_ids)

    words = []
    for w in qs:
        is_known = w.id in known_ids if request.user.is_authenticated else None
        words.append({
            'id': w.id,
            'word': w.word,
            'definition': w.definition,
            'example': w.example,
            'exam_tags': w.exam_tags,
            'difficulty': w.difficulty,
            'is_known': is_known,
        })

    return Response(words)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vocab_mark(request, word_id):
    """
    POST /practice/vocab/{id}/mark/
    Body: { "known": true|false }
    Returns: { "known": bool }
    """
    known = request.data.get('known')
    if known is None:
        return Response({'detail': 'known field is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        word = VocabWord.objects.get(pk=word_id)
    except VocabWord.DoesNotExist:
        return Response({'detail': 'Word not found.'}, status=status.HTTP_404_NOT_FOUND)

    progress, _ = UserVocabProgress.objects.get_or_create(user=request.user, word=word)
    progress.known = bool(known)
    progress.save(update_fields=['known', 'reviewed_at'])
    return Response({'known': progress.known})


@api_view(['GET'])
@permission_classes([AllowAny])
def vocab_stats(request):
    """
    GET /practice/vocab/stats/
    Returns { total, known, by_difficulty, by_exam }
    """
    total = VocabWord.objects.count()

    if not request.user.is_authenticated:
        return Response({
            'total': total,
            'known': 0,
            'by_difficulty': {},
            'by_exam': {},
        })

    known_word_ids = set(
        UserVocabProgress.objects.filter(user=request.user, known=True)
        .values_list('word_id', flat=True)
    )
    known = len(known_word_ids)

    # by_difficulty
    by_difficulty = {}
    for diff in ['basic', 'intermediate', 'advanced']:
        diff_total = VocabWord.objects.filter(difficulty=diff).count()
        diff_known = VocabWord.objects.filter(difficulty=diff, id__in=known_word_ids).count()
        by_difficulty[diff] = {'total': diff_total, 'known': diff_known}

    # by_exam (collect all unique tags first)
    all_tags = set()
    for tags in VocabWord.objects.values_list('exam_tags', flat=True):
        all_tags.update(tags or [])

    by_exam = {}
    for tag in sorted(all_tags):
        tag_total = VocabWord.objects.filter(exam_tags__contains=tag).count()
        tag_known = VocabWord.objects.filter(exam_tags__contains=tag, id__in=known_word_ids).count()
        by_exam[tag] = {'total': tag_total, 'known': tag_known}

    return Response({
        'total': total,
        'known': known,
        'by_difficulty': by_difficulty,
        'by_exam': by_exam,
    })


# ─── Saved Words ───────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def saved_words(request):
    """
    GET  /practice/saved-words/  → list user's saved words
    POST /practice/saved-words/  → save { word, definition, note }
    """
    if request.method == 'GET':
        qs = SavedWord.objects.filter(user=request.user)
        return Response([
            {
                'id': w.id,
                'word': w.word,
                'definition': w.definition,
                'note': w.note,
                'saved_at': w.saved_at.isoformat(),
            }
            for w in qs
        ])

    word = request.data.get('word', '').strip()
    if not word:
        return Response({'detail': 'word is required.'}, status=status.HTTP_400_BAD_REQUEST)
    obj, created = SavedWord.objects.get_or_create(
        user=request.user,
        word=word,
        defaults={
            'definition': request.data.get('definition', ''),
            'note': request.data.get('note', ''),
        },
    )
    if not created:
        # Update definition/note if re-saving
        obj.definition = request.data.get('definition', obj.definition)
        obj.note = request.data.get('note', obj.note)
        obj.save(update_fields=['definition', 'note'])
    return Response(
        {'id': obj.id, 'word': obj.word, 'definition': obj.definition, 'note': obj.note, 'saved_at': obj.saved_at.isoformat()},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_saved_word(request, pk):
    """DELETE /practice/saved-words/<id>/"""
    try:
        obj = SavedWord.objects.get(pk=pk, user=request.user)
    except SavedWord.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
