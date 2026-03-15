from django.urls import path
from . import api_views

urlpatterns = [
    path('threads/',                    api_views.threads,       name='community-threads'),
    path('threads/<int:pk>/',           api_views.thread_detail,  name='community-thread-detail'),
    path('threads/<int:pk>/delete/',    api_views.delete_thread,  name='community-delete-thread'),
    path('threads/<int:pk>/replies/',   api_views.add_reply,     name='community-add-reply'),
    path('threads/<int:pk>/vote/',      api_views.vote_thread,   name='community-vote'),
    path('replies/<int:pk>/accept/',    api_views.accept_reply,  name='community-accept-reply'),
]
