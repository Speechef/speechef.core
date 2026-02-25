from django.urls import path, include
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
        'analysis': {
            'upload': '/api/v1/analysis/upload/',
            'sessions': '/api/v1/analysis/sessions/',
        },
        'jobs': {
            'list': '/api/v1/jobs/',
            'apply': '/api/v1/jobs/<id>/apply/',
            'my_applications': '/api/v1/jobs/my-applications/',
        },
        'review': {
            'experts': '/api/v1/review/experts/',
            'submit': '/api/v1/review/submit/',
            'my_reviews': '/api/v1/review/my/',
        },
        'testprep': {
            'exams': '/api/v1/testprep/exams/',
            'attempts': '/api/v1/testprep/attempts/',
        },
        'mentors': {
            'list': '/api/v1/mentors/',
            'sessions': '/api/v1/mentors/sessions/my/',
        },
        'roleplay': {
            'start': '/api/v1/roleplay/start/',
            'my_sessions': '/api/v1/roleplay/my/',
        },
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/', include('users.api_urls')),
    path('learn/', include('learn.api_urls')),
    path('practice/', include('practice.api_urls')),
    path('analysis/', include('analysis.api_urls')),
    path('jobs/', include('jobs.api_urls')),
    path('review/', include('review.api_urls')),
    path('testprep/', include('testprep.api_urls')),
    path('mentors/', include('mentorship.api_urls')),
    path('roleplay/', include('roleplay.api_urls')),
]
