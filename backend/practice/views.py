from django.shortcuts import render
from django.db.models import Sum, Count
from .models import Practice, WordQuestion, GameSession
from .utils import update_streak
import random
import json


def practice_index(request):
    practices = Practice.objects.all()
    return render(request, "practice/practice.html", {"practices": practices})


def guess_the_word(request):
    questions = list(WordQuestion.objects.all())
    if not questions:
        return render(request, 'practice/guess_the_word.html', {'no_questions': True})

    if request.method == 'POST':
        question_id = request.POST.get('question_id')
        selected = request.POST.get('option')
        try:
            question = WordQuestion.objects.get(pk=question_id)
        except WordQuestion.DoesNotExist:
            question = random.choice(questions)
        is_correct = (selected == question.correct_meaning)

        if request.user.is_authenticated:
            score = 10 if is_correct else 0
            GameSession.objects.create(user=request.user, game='guess', score=score)
            update_streak(request.user)

        return render(request, 'practice/guess_result.html', {
            'question': question,
            'selected': selected,
            'is_correct': is_correct,
        })

    question = random.choice(questions)
    options = question.get_options()
    random.shuffle(options)
    return render(request, 'practice/guess_the_word.html', {
        'question': question,
        'options': options,
    })


def word_scramble(request):
    words = list(WordQuestion.objects.all())
    if not words:
        return render(request, 'practice/word_scramble.html', {'no_words': True})

    if request.method == 'POST':
        word_id = request.POST.get('word_id')
        user_answer = request.POST.get('user_answer', '').strip()
        try:
            word = WordQuestion.objects.get(pk=word_id)
        except WordQuestion.DoesNotExist:
            word = random.choice(words)
        is_correct = user_answer.lower() == word.word.lower()

        if request.user.is_authenticated:
            score = 10 if is_correct else 0
            GameSession.objects.create(user=request.user, game='scramble', score=score)
            update_streak(request.user)

        return render(request, 'practice/word_scramble_result.html', {
            'word': word,
            'user_answer': user_answer,
            'is_correct': is_correct,
        })

    word = random.choice(words)
    scrambled = ''.join(random.sample(word.word, len(word.word)))
    attempts = 0
    while scrambled == word.word and len(word.word) > 1 and attempts < 10:
        scrambled = ''.join(random.sample(word.word, len(word.word)))
        attempts += 1

    return render(request, 'practice/word_scramble.html', {
        'word': word,
        'scrambled_word': scrambled,
    })


def memory_match(request):
    questions = list(WordQuestion.objects.all())
    if not questions:
        return render(request, 'practice/memory_match.html', {'no_questions': True})

    if request.method == 'POST':
        attempts = int(request.POST.get('attempts', 0))
        total_pairs = int(request.POST.get('total_pairs', 6))
        score = max(0, total_pairs * 10 - max(0, attempts - total_pairs))

        if request.user.is_authenticated:
            GameSession.objects.create(user=request.user, game='memory', score=score)
            update_streak(request.user)

        return render(request, 'practice/memory_match_result.html', {
            'attempts': attempts,
            'score': score,
            'total_pairs': total_pairs,
        })

    count = min(6, len(questions))
    pairs = random.sample(questions, count)
    pairs_data = [
        {'id': q.id, 'word': q.word, 'meaning': q.correct_meaning}
        for q in pairs
    ]
    return render(request, 'practice/memory_match.html', {
        'pairs_json': json.dumps(pairs_data),
        'total_pairs': count,
    })


def leaderboard(request):
    game_filter = request.GET.get('game', '')
    sessions = GameSession.objects.all()
    if game_filter:
        sessions = sessions.filter(game=game_filter)

    entries = (
        sessions
        .values('user__username')
        .annotate(total_score=Sum('score'), sessions=Count('id'))
        .order_by('-total_score')[:10]
    )

    return render(request, 'practice/leaderboard.html', {
        'entries': entries,
        'game_filter': game_filter,
        'game_choices': GameSession.GAME_CHOICES,
    })
