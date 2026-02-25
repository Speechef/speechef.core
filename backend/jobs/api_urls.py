from django.urls import path
from . import api_views

urlpatterns = [
    path("", api_views.job_list, name="job-list"),
    path("create/", api_views.job_create, name="job-create"),
    path("<int:pk>/", api_views.job_detail, name="job-detail"),
    path("<int:pk>/apply/", api_views.job_apply, name="job-apply"),
    path("my-applications/", api_views.my_applications, name="job-my-applications"),
]
