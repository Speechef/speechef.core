from django.urls import path
from . import views

urlpatterns = [
    # path("", views.index, name="index"),
    path("", views.learn_index, name="learn_index"),
    path("post/<int:pk>/", views.learn_detail, name="learn_detail"),
    path("category/<category>/", views.learn_category, name="learn_category"),    
]