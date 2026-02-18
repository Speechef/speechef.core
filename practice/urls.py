from django.urls import path
from . import views

urlpatterns = [
    path("", views.practice_index, name="practice_index"),
    path('guess-the-word/', views.guess_the_word, name='guess_the_word'),
    path('word-scramble/', views.word_scramble, name='word_scramble'),
    # path('memory-match/', views.memory_match, name='memory_match'),
]