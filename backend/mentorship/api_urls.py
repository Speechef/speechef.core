from django.urls import path
from . import api_views

urlpatterns = [
    path("", api_views.mentor_list, name="mentor-list"),
    path("<int:pk>/", api_views.mentor_detail, name="mentor-detail"),
    path("<int:pk>/availability/", api_views.mentor_availability, name="mentor-availability"),
    path("<int:pk>/book/", api_views.mentor_book, name="mentor-book"),
    path("sessions/my/", api_views.my_sessions, name="mentor-sessions-my"),
    path("sessions/<int:pk>/rate/", api_views.rate_session, name="mentor-session-rate"),
    path("sessions/<int:pk>/homework/", api_views.session_homework, name="mentor-session-homework"),
]
