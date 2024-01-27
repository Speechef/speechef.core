from django.urls import path
from . import views

urlpatterns = [
    # path("", views.index, name="index"),
    path("", views.home_index, name="home_index"),
    path("post/<int:pk>/", views.home_detail, name="home_detail"),
    path("category/<category>/", views.home_category, name="home_category"),    
]