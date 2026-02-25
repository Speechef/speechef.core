from django.urls import path
from . import api_views

urlpatterns = [
    path("upload/", api_views.upload_analysis, name="analysis-upload"),
    path("sessions/", api_views.session_list, name="analysis-session-list"),
    path("<int:pk>/status/", api_views.session_status, name="analysis-status"),
    path("<int:pk>/results/", api_views.session_results, name="analysis-results"),
    path("<int:pk>/share/", api_views.share_scorecard, name="analysis-share"),
]
