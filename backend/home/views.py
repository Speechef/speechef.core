from django.shortcuts import render
from django.http import HttpResponse


def home_index(request):
    return render(request, "home/index.html")