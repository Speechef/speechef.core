from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
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
    badges = UserBadge.objects.filter(user=user).select_related('badge')

    # Latest Speechef score (from analysis sessions if available)
    latest_score = None
    try:
        from analysis.models import AnalysisSession, AnalysisResult
        session = AnalysisSession.objects.filter(user=user, status='done').order_by('-created_at').first()
        if session:
            result = AnalysisResult.objects.filter(session=session).first()
            if result:
                latest_score = result.overall_score
    except Exception:
        pass

    return Response({
        'username': user.username,
        'current_streak': profile.current_streak if profile else 0,
        'longest_streak': profile.longest_streak if profile else 0,
        'latest_score': latest_score,
        'badges': UserBadgeSerializer(badges, many=True).data,
    })
