from django.urls import path
from .api_views import (
    RegisterView, ProfileView,
    notification_list, notification_read, notification_read_all, notification_unread_count,
    badge_list, public_profile,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    # Notifications
    path('notifications/', notification_list, name='notification-list'),
    path('notifications/unread-count/', notification_unread_count, name='notification-unread-count'),
    path('notifications/read-all/', notification_read_all, name='notification-read-all'),
    path('notifications/<int:pk>/read/', notification_read, name='notification-read'),
    # Badges
    path('badges/', badge_list, name='badge-list'),
    # Public profile
    path('users/<str:username>/', public_profile, name='public-profile'),
]
