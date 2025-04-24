from django.urls import path
from . import views

urlpatterns = [
    path("", views.practice_index, name="practice_index"),
    path('guess-the-word/', views.guess_the_word, name='guess_the_word'),
]