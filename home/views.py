from django.shortcuts import render
from django.http import HttpResponse
from home.models import Post, Comment


def index(request):
    return HttpResponse("You're at Home Page")


def home_index(request):
    posts = Post.objects.all().order_by("-created_on")
    context = {
        "posts": posts,
    }
    return render(request, "home/index.html", context)

def home_category(request, category):
    posts = Post.objects.filter(
        categories__name__contains=category
    ).order_by("-created_on")
    context = {
        "category": category,
        "posts": posts,
    }
    return render(request, "home/category.html", context)

def home_detail(request, pk):
    post = Post.objects.get(pk=pk)
    comments = Comment.objects.filter(post=post)
    context = {
        "post": post,
        "comments": comments,
    }

    return render(request, "home/detail.html", context)