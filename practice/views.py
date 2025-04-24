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
