import logging

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)
from .models import Notification, UserBadge
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileUpdateSerializer,
    NotificationSerializer, UserBadgeSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        if self.request.method in ('PUT', 'PATCH'):
            return self.request.user.profile
        return self.request.user


# ── Password change ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get('current_password', '')
    new_pw  = request.data.get('new_password', '')
    if not current or not new_pw:
        return Response({'detail': 'Both current_password and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not user.check_password(current):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(new_pw, user)
    except Exception as e:
        return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_pw)
    user.save()
    return Response({'ok': True})


# ── User settings (notification + privacy prefs) ──────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    profile = request.user.profile
    if request.method == 'GET':
        return Response({
            'notification_prefs': profile.notification_prefs or {},
            'privacy_prefs':      profile.privacy_prefs or {},
        })
    # PATCH — update whichever keys are provided
    update_fields = []
    if 'notification_prefs' in request.data:
        profile.notification_prefs = request.data['notification_prefs']
        update_fields.append('notification_prefs')
    if 'privacy_prefs' in request.data:
        profile.privacy_prefs = request.data['privacy_prefs']
        update_fields.append('privacy_prefs')
    if update_fields:
        profile.save(update_fields=update_fields)
    return Response({'ok': True})


# ── Password reset ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    identifier = request.data.get('email', '').strip()
    if not identifier:
        return Response({'detail': 'Email or username is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    try:
        user = User.objects.get(email__iexact=identifier)
    except User.DoesNotExist:
        try:
            user = User.objects.get(username__iexact=identifier)
        except User.DoesNotExist:
            pass

    if user:
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
        # In development: log the link to stdout/server log for easy access.
        logger.info('[PASSWORD RESET] %s', reset_url)
        print(f'\n[PASSWORD RESET] {reset_url}\n', flush=True)

    # Always return success to prevent user enumeration.
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    uid          = request.data.get('uid', '')
    token        = request.data.get('token', '')
    new_password = request.data.get('new_password', '')

    if not uid or not token or not new_password:
        return Response({'detail': 'uid, token, and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user    = User.objects.get(pk=user_pk)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Reset link has expired or is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user)
    except Exception as e:
        return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'ok': True})


# ── Notifications ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifs = Notification.objects.filter(user=request.user)[:20]
    return Response(NotificationSerializer(notifs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    notif.read = True
    notif.save()
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_read_all(request):
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    count = Notification.objects.filter(user=request.user, read=False).count()
    return Response({'count': count})


# ── Badges ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def badge_list(request):
    user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
    return Response(UserBadgeSerializer(user_badges, many=True).data)


# ── Public profile ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def public_profile(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    profile = getattr(user, 'profile', None)
    prefs = (profile.privacy_prefs or {}) if profile else {}

    # Respect privacy: if profile is set to private, return 403
    if not prefs.get('public_profile', True):
        return Response({'detail': 'This profile is private.'}, status=status.HTTP_403_FORBIDDEN)

    badges = UserBadge.objects.filter(user=user).select_related('badge')

    # Latest Speechef score (from analysis sessions if available)
    latest_score = None
    if prefs.get('show_score', True):
        try:
            from analysis.models import AnalysisSession, AnalysisResult
            session = AnalysisSession.objects.filter(user=user, status='done').order_by('-created_at').first()
            if session:
                result = AnalysisResult.objects.filter(session=session).first()
                if result:
                    latest_score = result.overall_score
        except Exception:
            pass

    show_streak = prefs.get('show_streak', True)
    return Response({
        'username': user.username,
        'current_streak': (profile.current_streak if profile else 0) if show_streak else None,
        'longest_streak': (profile.longest_streak if profile else 0) if show_streak else None,
        'latest_score': latest_score,
        'badges': UserBadgeSerializer(badges, many=True).data,
    })
