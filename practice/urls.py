from django.urls import path
from . import views

urlpatterns = [
    path("", views.practice_index, name="practice_index"),
]