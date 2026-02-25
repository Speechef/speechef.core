from django.urls import path
from . import api_views

urlpatterns = [
    path("exams/", api_views.exam_list, name="testprep-exam-list"),
    path("exams/<slug:slug>/", api_views.exam_detail, name="testprep-exam-detail"),
    path("exams/<slug:exam_slug>/sections/<slug:section_slug>/questions/", api_views.section_questions, name="testprep-questions"),
    path("attempts/start/", api_views.attempt_start, name="testprep-attempt-start"),
    path("attempts/my/", api_views.my_attempts, name="testprep-my-attempts"),
    path("attempts/<int:pk>/answer/", api_views.attempt_answer, name="testprep-attempt-answer"),
    path("attempts/<int:pk>/complete/", api_views.attempt_complete, name="testprep-attempt-complete"),
]
