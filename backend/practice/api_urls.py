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
    path('guess/complete/', api_views.guess_complete, name='practice-guess-complete'),
    path('my-best/', api_views.my_best, name='practice-my-best'),
    path('daily/', api_views.daily_challenge, name='practice-daily'),
    path('sentence-check/', api_views.sentence_check, name='practice-sentence-check'),
    path('pronunciation-check/', api_views.pronunciation_check, name='practice-pronunciation-check'),
    # Vocabulary tracker
    path('vocab/', api_views.vocab_list, name='practice-vocab-list'),
    path('vocab/stats/', api_views.vocab_stats, name='practice-vocab-stats'),
    path('vocab/<int:word_id>/mark/', api_views.vocab_mark, name='practice-vocab-mark'),
    # Saved words
    path('saved-words/', api_views.saved_words, name='practice-saved-words'),
    path('saved-words/<int:pk>/', api_views.delete_saved_word, name='practice-saved-word-delete'),
]
