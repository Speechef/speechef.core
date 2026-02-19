from django.urls import path
from . import api_views

urlpatterns = [
    path('posts/', api_views.posts, name='learn-posts'),
    path('posts/<int:pk>/', api_views.post_detail, name='learn-post-detail'),
    path('posts/<int:pk>/comments/', api_views.post_comment, name='learn-post-comment'),
    path('categories/', api_views.categories, name='learn-categories'),
]
