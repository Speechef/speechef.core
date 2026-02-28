from django.urls import path
from . import api_views

urlpatterns = [
    path('analyze/',          api_views.analyze_writing, name='writing-analyze'),
    path('sessions/',         api_views.writing_sessions, name='writing-sessions'),
    path('resume/analyze/',   api_views.analyze_resume, name='writing-resume-analyze'),
    path('resume/sessions/',  api_views.resume_sessions, name='writing-resume-sessions'),
]
