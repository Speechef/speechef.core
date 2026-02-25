from django.urls import path
from . import api_views

urlpatterns = [
    path("experts/", api_views.expert_list, name="review-expert-list"),
    path("experts/<int:pk>/", api_views.expert_detail, name="review-expert-detail"),
    path("submit/", api_views.review_submit, name="review-submit"),
    path("my/", api_views.my_reviews, name="review-my"),
    path("<int:pk>/status/", api_views.review_status, name="review-status"),
    path("<int:pk>/feedback/", api_views.review_feedback, name="review-feedback"),
    path("<int:pk>/rate/", api_views.review_rate, name="review-rate"),
    path("<int:pk>/messages/", api_views.review_messages, name="review-messages"),
]
