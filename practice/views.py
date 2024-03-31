from django.shortcuts import render
from django.http import HttpResponse
from .models import Practice

def practice_index(request):
    practices = Practice.objects.all()
    return render(request, "practice/practice.html", {"practices": practices})
