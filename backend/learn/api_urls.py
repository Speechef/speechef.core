from django.urls import path
from . import api_views

urlpatterns = [
    path('posts/', api_views.posts, name='learn-posts'),
    path('posts/<int:pk>/', api_views.post_detail, name='learn-post-detail'),
    path('posts/<int:pk>/comments/', api_views.post_comment, name='learn-post-comment'),
    path('posts/<int:pk>/bookmark/', api_views.bookmark_toggle, name='learn-bookmark-toggle'),
    path('posts/<int:pk>/complete/', api_views.post_complete, name='learn-post-complete'),
    path('categories/', api_views.categories, name='learn-categories'),
]
