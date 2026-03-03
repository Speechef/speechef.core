import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
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
        uid       = urlsafe_base64_encode(force_bytes(user.pk))
        token     = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        subject   = 'Reset your Speechef password'
        plain_msg = (
            f"Hi {user.username},\n\n"
            f"We received a request to reset your Speechef password.\n"
            f"Click the link below to choose a new password (valid for 1 hour):\n\n"
            f"{reset_url}\n\n"
            f"If you didn't request this, you can safely ignore this email.\n\n"
            f"— The Speechef Team"
        )
        html_msg = (
            f"<div style='font-family:sans-serif;max-width:520px;margin:auto'>"
            f"<div style='background:linear-gradient(135deg,#141c52,#1a2460);padding:32px 40px;border-radius:16px 16px 0 0'>"
            f"<p style='color:#FADB43;font-size:22px;font-weight:900;margin:0'>Speechef</p>"
            f"</div>"
            f"<div style='background:#ffffff;padding:32px 40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb'>"
            f"<h2 style='color:#141c52;margin-top:0'>Reset your password</h2>"
            f"<p style='color:#6b7280'>Hi <strong>{user.username}</strong>,</p>"
            f"<p style='color:#6b7280'>We received a request to reset your Speechef password. "
            f"Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.</p>"
            f"<a href='{reset_url}' style='display:inline-block;margin:20px 0;padding:14px 28px;"
            f"background:linear-gradient(to right,#FADB43,#fe9940);color:#141c52;"
            f"font-weight:700;border-radius:50px;text-decoration:none;font-size:15px'>"
            f"Reset my password →</a>"
            f"<p style='color:#9ca3af;font-size:12px;margin-top:24px'>If you didn't request this, "
            f"you can safely ignore this email. The link will expire automatically.</p>"
            f"</div></div>"
        )

        try:
            send_mail(
                subject=subject,
                message=plain_msg,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_msg,
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but still return success to prevent user enumeration
            logger.error('Password reset email failed for user %s: %s', user.pk, e)
            # Fall back to console log so the link isn't lost in dev
            logger.info('[PASSWORD RESET FALLBACK] %s', reset_url)

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


# ── Account deletion (ACC1.1) ─────────────────────────────────────────────────

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Permanently delete the authenticated user's account and all associated data."""
    user = request.user
    user.delete()
    return Response({'deleted': True}, status=status.HTTP_200_OK)


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


# ── Google OAuth ──────────────────────────────────────────────────────────────

def _unique_username(email: str, name: str) -> str:
    """Generate a unique username derived from the user's Google name or email."""
    import re
    base = (name or email.split('@')[0]).lower()
    base = re.sub(r'[^a-z0-9_]', '_', base)[:20].strip('_') or 'user'
    if not User.objects.filter(username=base).exists():
        return base
    i = 1
    while User.objects.filter(username=f'{base}{i}').exists():
        i += 1
    return f'{base}{i}'


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    POST /auth/google/
    Body: { "credential": "<Google ID token>" }
    Verifies the Google ID token, finds or creates a local user, and returns JWT tokens.
    """
    import requests as http_requests
    from rest_framework_simplejwt.tokens import RefreshToken

    credential = request.data.get('credential', '').strip()
    if not credential:
        return Response({'detail': 'credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify the Google ID token via Google's tokeninfo endpoint
    try:
        resp = http_requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'id_token': credential},
            timeout=5,
        )
        payload = resp.json()
    except Exception as e:
        logger.error('Google tokeninfo request failed: %s', e)
        return Response({'detail': 'Google verification failed. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    if 'error' in payload or resp.status_code != 200:
        return Response({'detail': 'Invalid Google token.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate the audience matches our client ID
    google_client_id = settings.GOOGLE_CLIENT_ID
    if google_client_id and payload.get('aud') != google_client_id:
        return Response({'detail': 'Token audience mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

    email = payload.get('email', '').lower().strip()
    name  = payload.get('name', '')

    if not email:
        return Response({'detail': 'No email returned from Google.'}, status=status.HTTP_400_BAD_REQUEST)

    # Find existing user by email (case-insensitive) or create a new one
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=_unique_username(email, name),
            email=email,
            password=None,  # No password — Google-only account
        )
        # Sync the display name if available
        if name:
            parts = name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name  = parts[1] if len(parts) > 1 else ''
            user.save(update_fields=['first_name', 'last_name'])

    # Issue JWT tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    })
