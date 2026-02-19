from django.urls import path
from . import api_views

urlpatterns = [
    path('question/', api_views.question, name='practice-question'),
    path('guess/', api_views.guess, name='practice-guess'),
    path('memory-match/', api_views.memory_match, name='practice-memory-match'),
    path('word-scramble/', api_views.word_scramble, name='practice-word-scramble'),
    path('word-scramble/check/', api_views.word_scramble_check, name='practice-word-scramble-check'),
    path('leaderboard/', api_views.leaderboard, name='practice-leaderboard'),
    path('sessions/', api_views.sessions, name='practice-sessions'),
]
