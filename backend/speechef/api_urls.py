from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response({
        'token': reverse('token_obtain_pair', request=request, format=format),
        'token_refresh': reverse('token_refresh', request=request, format=format),
        'auth': {
            'register': '/api/v1/auth/register/',
            'profile': '/api/v1/auth/profile/',
        },
        'learn': {
            'posts': '/api/v1/learn/posts/',
            'categories': '/api/v1/learn/categories/',
        },
        'practice': {
            'question': '/api/v1/practice/question/',
            'guess': '/api/v1/practice/guess/',
            'memory_match': '/api/v1/practice/memory-match/',
            'word_scramble': '/api/v1/practice/word-scramble/',
            'leaderboard': '/api/v1/practice/leaderboard/',
            'sessions': '/api/v1/practice/sessions/',
        },
        'jobs': {
            'list': '/api/v1/jobs/',
        },
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
