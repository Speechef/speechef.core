from django.urls import path
from . import api_views

urlpatterns = [
    path("start/", api_views.start_session, name="roleplay-start"),
    path("my/", api_views.my_sessions, name="roleplay-my-sessions"),
    path("<int:pk>/", api_views.session_detail, name="roleplay-detail"),
    path("<int:pk>/turn/", api_views.send_turn, name="roleplay-turn"),
    path("<int:pk>/finish/", api_views.finish_session, name="roleplay-finish"),
]
