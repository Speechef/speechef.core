from django.urls import path
from .api_views import (
    RegisterView, ProfileView, change_password,
    user_settings, delete_account,
    forgot_password, reset_password,
    google_auth,
    notification_list, notification_read, notification_read_all, notification_unread_count,
    badge_list, public_profile,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('google/', google_auth, name='google-auth'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('change-password/', change_password, name='change-password'),
    path('settings/', user_settings, name='user-settings'),
    path('account/', delete_account, name='delete-account'),  # ACC1.1
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password, name='reset-password'),
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
