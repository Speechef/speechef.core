from django.urls import path
from . import views

urlpatterns = [
    path("", views.jobs_index, name="jobs_index"),
]