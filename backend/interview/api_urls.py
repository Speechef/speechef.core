from django.urls import path
from . import api_views

urlpatterns = [
    path('start/',         api_views.start_session,  name='interview-start'),
    path('my/',            api_views.my_sessions,    name='interview-my'),
    path('<int:pk>/',      api_views.session_detail, name='interview-detail'),
    path('<int:pk>/answer/', api_views.answer_turn,  name='interview-answer'),
    path('<int:pk>/finish/', api_views.finish_session, name='interview-finish'),
]
