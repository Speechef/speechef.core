from django.shortcuts import render
from django.http import HttpResponse
from .models import Practice
from .models import WordQuestion
import random

def practice_index(request):
    practices = Practice.objects.all()
    return render(request, "practice/practice.html", {"practices": practices})


def guess_the_word(request):
    question = random.choice(WordQuestion.objects.all())
    
    if request.method == 'POST':
        selected = request.POST.get('option')
        is_correct = (selected == question.correct_meaning)
        return render(request, 'practice/guess_result.html', {
            'question': question,
            'selected': selected,
            'is_correct': is_correct
        })

    options = question.get_options()
    random.shuffle(options)
    return render(request, 'practice/guess_the_word.html', {
        'question': question,
        'options': options
    })

def word_scramble(request):
    words = list(WordQuestion.objects.all())
    if not words:
        return HttpResponse("No words available for scrambling.")
    
    word = random.choice(words)
    scrambled_word = ''.join(random.sample(word.word, len(word.word)))

    if request.method == 'POST':
        user_input = request.POST.get('scrambled_word')
        is_correct = (user_input == word.word)
        return render(request, 'practice/word_scramble_result.html', {
            'word': word,
            'scrambled_word': scrambled_word,
            'is_correct': is_correct
        })

    return render(request, 'practice/word_scramble.html', {
        'scrambled_word': scrambled_word
    })
