from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("You're at Home Page")


def home_index(request):
    return render(request, "home/index.html")