from django.urls import path
from . import api_views

urlpatterns = [
    # Public listing & detail
    path("", api_views.mentor_list, name="mentor-list"),
    path("recommended/", api_views.recommended_mentors, name="mentor-recommended"),  # MM5.1
    path("<int:pk>/", api_views.mentor_detail, name="mentor-detail"),
    path("<int:pk>/availability/", api_views.mentor_availability, name="mentor-availability"),

    # Intro video
    path("<int:pk>/intro-video/", api_views.mentor_intro_video, name="mentor-intro-video"),  # MM14.1

    # Booking
    path("<int:pk>/book/", api_views.mentor_book, name="mentor-book"),
    path("<int:pk>/bundles/<int:bundle_id>/purchase/", api_views.bundle_purchase, name="mentor-bundle-purchase"),  # MM4.1

    # Mentor dashboard & tools
    path("dashboard/", api_views.mentor_dashboard, name="mentor-dashboard"),         # MM2.1
    path("earnings/", api_views.mentor_earnings, name="mentor-earnings"),             # MM2.3
    path("profile/", api_views.mentor_profile_self, name="mentor-profile-self"),     # MM12.1
    path("unavailability/", api_views.unavailability_list, name="mentor-unavailability-list"),   # MM7.1
    path("unavailability/<int:pk>/", api_views.unavailability_detail, name="mentor-unavailability-detail"),

    # Student sessions
    path("sessions/my/", api_views.my_sessions, name="mentor-sessions-my"),
    path("sessions/<int:pk>/rate/", api_views.rate_session, name="mentor-session-rate"),
    path("sessions/<int:pk>/cancel/", api_views.cancel_session, name="mentor-session-cancel"),       # MM6.1
    path("sessions/<int:pk>/reschedule/", api_views.reschedule_session, name="mentor-session-reschedule"),  # MM6.2
    path("sessions/<int:pk>/homework/", api_views.session_homework, name="mentor-session-homework"),
    path("sessions/<int:pk>/reply/", api_views.session_reply, name="mentor-session-reply"),      # MM9.1
    path("sessions/<int:pk>/recording/", api_views.session_recording, name="mentor-session-recording"),  # MM3.2

    # Bundles
    path("bundles/confirm/", api_views.bundle_confirm, name="mentor-bundle-confirm"),  # MM4.1
    path("bundles/my/", api_views.my_bundles, name="mentor-bundles-my"),

    # Student progress
    path("students/<int:student_id>/progress/", api_views.student_progress, name="mentor-student-progress"),  # MM10.1
    path("students/<int:student_id>/note/", api_views.student_note, name="mentor-student-note"),

    # Follow / unfollow
    path("<int:pk>/follow/", api_views.follow_mentor, name="mentor-follow"),

    # Applications
    path("apply/", api_views.apply_mentor, name="mentor-apply"),
    path("apply/status/", api_views.apply_mentor_status, name="mentor-apply-status"),

    # Webhooks
    path("daily-webhook/", api_views.daily_webhook, name="mentor-daily-webhook"),  # MM3.1
]
